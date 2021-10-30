import argparse
import json
import os

parser = argparse.ArgumentParser(description='Convert us counties to geo json')
parser.add_argument('-t', '--topojson', help='The topojson file', required=True)
args = parser.parse_args()

def convert_to_geo(topojson_filename):
    os.system('''cat %s | \
        topo2geo counties=- > counties-geo.json
        ''' % topojson_filename)

if __name__ == '__main__':
    convert_to_geo(args.topojson)