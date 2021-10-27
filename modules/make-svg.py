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
    max_percent = max([float(county['percent']) for county in data_json['data']])

    # assign a color for each county
    colors = {}
    for county in data_json['data']:
        # state + county = fips
        h, s, l = convert_percent_to_hsl(float(county['percent']), max_percent)
        colors[county['state_fips'] + county['county_fips']] = f'hsl({h}, {s}%, {l}%)'

    # get geojson
    geojson_rows = db.execute(f'select * from GeoJSONs where state = "{state_fips}"')
    geojson_row = geojson_rows.first()

    # The geojson for the state
    geojson_json = json.loads(geojson_row[1])

    # Add proper color to each features
    for feature in geojson_json['features']:
        fips = feature['id'] # represents state + county
        if fips in colors:
            feature['properties'] = { 'fill' : colors[fips] }
        else:
            feature['properties'] = { 'fill' : 'hsl(120, {s}%, {l}%)'} # if not defined color green

    # convert to geojson
    geojson_str = json.dumps(geojson_json)
    geo2svg(geojson_str)

def geo2svg(geojson_str):
    # First write geojson to a file
    geojson = open('geojson.json', 'w')
    geojson.write(geojson_str)
    geojson.close()

    # Read the file
    geojson = open('geojson.json', 'r')
    geojson_json = json.load(geojson)

    # convert to ndjson
    os.system('''
        ndjson-split 'd.features' \
            < geojson.json \
            > geojson.ndjson
        ''')

    # convert to svg
    os.system('''
        geo2svg -n --stroke none -p 1 -w 960 -h 960 \
            < geojson.ndjson \
            > geojson.svg
    ''')

    # output to stdout
    os.system('cat geojson.svg')

    # cleanup
    os.system('rm geojson.svg geojson.json geojson.ndjson')

if __name__ == '__main__':
    color_json_from_session(args.session, args.fips)