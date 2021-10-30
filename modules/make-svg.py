import subprocess
import argparse
import sqlite3
import json
import db
import pprint

parser = argparse.ArgumentParser()
parser.add_argument('-s', '--session', help="Session token for user.", required=True)
parser.add_argument('-f', '--fips', help="State fips.", default=None)
parser.add_argument('-c', '--country_name', help="Country", default=None)
args = parser.parse_args()

LIMIT = 120 # limit 120 means hsl hue is 0 to 120 (i.e red to green)

def convert_percent_to_hsl(percent, max_val):
    h = LIMIT - int(percent * LIMIT / max_val)
    s = 90
    l = 61
    return (h, s, l)

def get_state_max(data_json, state_fips=None, country_name=None):
    # data json
    percent = 0.0
    if state_fips:
        percents = [float(county['percent']) for county in data_json['data'] if county['state_fips'] == state_fips]
    elif country_name:
        percents = [float(county['percent']) for county in data_json['data']]
    else:
        raise Exception('This should never happen but it did.')
    max_percent = max(percents)
    return max_percent

def get_colors(data_json, max_percent, state_fips=None, country_name=None):
    # assign a color for each county
    colors = {}
    for county in data_json['data']:
        if state_fips:
            # state + county = fips
            if county['state_fips'] == state_fips:
                h, s, l = convert_percent_to_hsl(float(county['percent']), max_percent)
                colors[county['state_fips'] + county['county_fips']] = { 'color': f'hsl({h}, {s}%, {l}%)' , 'percent': float(county['percent'])}
        elif country_name:
            h, s, l = convert_percent_to_hsl(float(county['percent']), max_percent)
            colors[county['state_fips'] + county['county_fips']] = { 'color': f'hsl({h}, {s}%, {l}%)' , 'percent': float(county['percent'])}
        else:
            raise Exception('This should never happen but it did.')
    return colors

def get_geojson(state_fips=None, country_name=None):
    # get geojson
    geojson_row = []
    if state_fips:
        geojson_rows = db.execute(f'select * from StateCountyGeoJsons where state = "{state_fips}"')
    elif country_name:
        geojson_rows = db.execute(f'select * from CountryCountyGeoJSONs where name = "{country_name}"')
    else:
        raise Exception('This should never happen but it did.')
    geojson_row = geojson_rows.first()

    # The geojson for the state
    geojson_json = json.loads(geojson_row[1])
    return geojson_json

def color_json_from_session(token, state_fips=None, country_name=None):
    # read data
    rows = db.execute(f'select * from SessionTokens where token = "{token}"')
    row = rows.first()
    data = row[1] # data column of SessionTokens

    # max percent
    data_json = json.loads(data)
    max_percent = get_state_max(data_json, state_fips=state_fips, country_name=country_name)

    # assign color to counties
    colors = get_colors(data_json, max_percent, state_fips=state_fips, country_name=country_name)

    # geojson
    geojson = get_geojson(state_fips=state_fips, country_name=country_name)

    # Add proper color to each features
    for feature in geojson['features']:
        fips = feature['id'] # represents state + county
        if fips in colors:
            feature['properties'] = { 'fill' : colors[fips]['color'] }
        else:
            feature['properties'] = { 'fill' : 'hsl(120, {s}%, {l}%)' } # if not defined color green

    # convert to geojson
    geojson_str = json.dumps(geojson)
    geo2svg(geojson_str)

def geo2svg(geojson_str):
    # write to file because echo can only handle limited about of strings
    geojson_outfile = open('geojson.json', 'w')
    geojson_outfile.write(geojson_str)
    geojson_outfile.flush()
    geojson_outfile.close()

    command = 'ndjson-split "d.features" < geojson.json | geo2svg -n --stroke none -p 1 -w 960 -h 960'.split(' ')
    # print(command)
    # subprocess.run()

    prog = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = prog.communicate()
    print(out, err)

    # geojson_svg = open('geojson.svg', 'r')
    # print(json.load(geojson_svg))
    # # clean up
    # subprocess.run(['rm geojson.json geojson.svg'.split(' ')])

if __name__ == '__main__':
    color_json_from_session(args.session, state_fips=args.fips, country_name=args.country_name)