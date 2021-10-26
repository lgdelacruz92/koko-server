import os
import argparse
import sqlite3
import json
import db

parser = argparse.ArgumentParser()
parser.add_argument("-g", "--geojson", help="GeoJSON string.", default=None)
parser.add_argument('-s', '--session', help="Session token for user.", default=None)
args = parser.parse_args()

LIMIT = 120 # limit 120 means hsl hue is 0 to 120 (i.e red to green)

def convert_percent_to_hsl(percent, max_val):
    h = LIMIT - int(percent * LIMIT / max_val)
    s = 90
    l = 61
    return (h, s, l)

def color_json_from_session(token):
    # read data
    data = db.execute(f'select * from SessionTokens where token = "{token}"')
    print(data.first())
    # data_json = json.loads(data.first())
    # print(data_json)

def color_ndjson():
    os.system('python3 ./features/population/state/20-to-24.py > data.txt')
    data = open('data.txt', 'r')

    # get max value
    max_val = 0
    saved_rows = []
    for row in data.readlines():
        tokens = row.replace(' ', '').replace(')','').replace('(','').replace("'",'').split(',')
        value = float(tokens[1])
        if value > max_val:
            max_val = value
        saved_rows.append(tokens)

    # color each path
    color_map = {}
    for row in saved_rows:
        dp05_0006pe = float(row[1])
        h,s,l = convert_percent_to_hsl(dp05_0006pe, max_val)

        color_map[row[2] + row[3]] = f'hsl({h}, {s}%, {l}%)'

    ndjson_bk = open('geojson-bk.ndjson', 'w')
    ndjson = open('geojson.ndjson', 'r')
    for line in ndjson:
        path_dict = json.loads(line.replace('\n', ''))
        path_dict['properties'] = { "fill": color_map[path_dict['id']] }

        new_path = json.dumps(path_dict)
        ndjson_bk.write(new_path + '\n')

    # make sure to close the files and the database
    ndjson.close()
    ndjson_bk.close()

    # clean up
    os.system('rm geojson.ndjson')
    os.system('mv geojson-bk.ndjson geojson.ndjson')


if __name__ == '__main__':
    if args.geojson:
        geojson = open('geojson.json', 'w')

        geojson.write(args.geojson)
        geojson.close()

        geojson = open('geojson.json', 'r')
        geojson_json = json.load(geojson)

        os.system('''
            ndjson-split 'd.features' \
                < geojson.json \
                > geojson.ndjson
            ''')

        # colors the svg
        color_ndjson(geojson_json['metadata'])

        os.system('''
            geo2svg -n --stroke none -p 1 -w 960 -h 960 \
                < geojson.ndjson \
                > geojson.svg
        ''')

        os.system('cat geojson.svg')

        # cleanup
        os.system('rm geojson.svg geojson.json geojson.ndjson')
    elif args.session:
        color_json_from_session(args.session)