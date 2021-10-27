import os
import argparse
import sqlite3
import json
import db
import pprint

parser = argparse.ArgumentParser()
parser.add_argument('-s', '--session', help="Session token for user.", required=True)
parser.add_argument('-f', '--fips', help="State fips.", required=True)
args = parser.parse_args()

LIMIT = 120 # limit 120 means hsl hue is 0 to 120 (i.e red to green)

def convert_percent_to_hsl(percent, max_val):
    h = LIMIT - int(percent * LIMIT / max_val)
    s = 90
    l = 61
    return (h, s, l)

def color_json_from_session(token, state_fips):
    # read data
    rows = db.execute(f'select * from SessionTokens where token = "{token}"')
    row = rows.first()
    data = row[1] # data column of SessionTokens

    # data json
    data_json = json.loads(data)
    percents = [float(county['percent']) for county in data_json['data'] if county['state_fips'] == state_fips]
    max_percent = max(percents)

    # assign a color for each county
    colors = {}
    for county in data_json['data']:
        # state + county = fips
        if county['state_fips'] == state_fips:
            h, s, l = convert_percent_to_hsl(float(county['percent']), max_percent)
            colors[county['state_fips'] + county['county_fips']] = { 'color': f'hsl({h}, {s}%, {l}%)' , 'percent': float(county['percent'])}

    # get geojson
    geojson_rows = db.execute(f'select * from GeoJSONs where state = "{state_fips}"')
    geojson_row = geojson_rows.first()

    # The geojson for the state
    geojson_json = json.loads(geojson_row[1])

    # Add proper color to each features
    for feature in geojson_json['features']:
        fips = feature['id'] # represents state + county
        if fips in colors:
            feature['properties'] = { 'fill' : colors[fips]['color'] }
        else:
            feature['properties'] = { 'fill' : 'hsl(120, {s}%, {l}%)' } # if not defined color green

    # convert to geojson
    geojson_str = json.dumps(geojson_json)
    geo2svg(geojson_str)

def geo2svg(geojson_str):
    # convert to ndjson
    os.system('''echo '%s'\
        | ndjson-split 'd.features' \
        | geo2svg -n --stroke none -p 1 -w 960 -h 960
        ''' % (geojson_str))

if __name__ == '__main__':
    color_json_from_session(args.session, args.fips)