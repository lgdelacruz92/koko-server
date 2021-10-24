import os
import argparse

parser = argparse.ArgumentParser(description='Process county')
parser.add_argument('-A', '--all', action='store_true', help='Get all us counties.')
parser.add_argument('-s', '--state', help='County for a particular state')

args = parser.parse_args()

states = {
    'us': '*',
    'fl': '12'
}

quantized_albers = {
    'us': 'counties-albers-10m.json',
    'fl': 'fl-merge-topo.json'
}

def us_counties(county='us'):
    os.system('''
            topo2geo counties=- \
                < %s > counties-geo.json
            ''' % quantized_albers[county])

    os.system('''
        ndjson-split 'd.features' \
            < counties-geo.json \
            > counties-geo.ndjson
            ''')

    os.system("curl 'https://api.census.gov/data/2019/acs/acs5/profile?get=DP05_0006PE&for=county:*&in=state:%s' -o census-20-to-24.json 2>/dev/null" % states[county])

    os.system('''
        ndjson-cat census-20-to-24.json \
            | ndjson-split 'd.slice(1)' \
            | ndjson-map '{id: d[1] + d[2], percent: d[0]}' \
            > census-20-to-24.ndjson
        ''')

    os.system('''
            ndjson-join 'd.id' \
                counties-geo.ndjson \
                census-20-to-24.ndjson \
                > counties-census-join.ndjson
        ''')
    os.system('python3 color-county.py counties-census-join.ndjson > counties-census-color.ndjson')

    os.system('''
        geo2svg -n --stroke none -p 1 -w 960 -h 960 \
            < counties-census-color.ndjson \
            > counties-census-color.svg
        ''')

    os.system('cat counties-census-color.svg')

if __name__ == '__main__':
    if args.all:
        us_counties()
    elif args.state == 'florida' or args.state == 'fl':
        us_counties('fl')
    else:
        print('some other state')