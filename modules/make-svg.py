import os
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("-g", "--geojson", help="GeoJSON string.", required=True)
args = parser.parse_args()

if __name__ == '__main__':
    geojson = open('geojson.json', 'w')
    geojson.write(args.geojson)
    geojson.close()

    # os.system('geo2svg -w 960 -h 960 < geojson.json > geojson.svg && cat geojson.svg')
    os.system('''
        ndjson-split 'd.features' \
            < geojson.json \
            > geojson.ndjson
        ''')

    os.system('''
        geo2svg -n -p 1 -w 960 -h 960 \
            < geojson.ndjson \
            > geojson.svg
    ''')

    os.system('cat geojson.svg')

    # cleanup
    os.system('rm geojson.svg geojson.json geojson.ndjson')