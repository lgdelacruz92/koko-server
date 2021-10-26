import sys
import argparse
import json

parser = argparse.ArgumentParser(description='Map ndjson to data json')
parser.add_argument('-f', '--file', help='Filename for the data', required=True)

args = parser.parse_args()

if __name__ == '__main__':
    data_ndjson = open(args.file, 'r')
    data_json_file = open('data.json', 'w')
    data_json = { 'data': [json.loads(line.replace('\n','')) for line in data_ndjson] }
    data_json_file.write(json.dumps(data_json))