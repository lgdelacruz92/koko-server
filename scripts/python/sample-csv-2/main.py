import os
import json
import argparse

parser = argparse.ArgumentParser(description='Sample 2')
parser.add_argument('-g', '--get', action="store_true", help='get the data')
parser.add_argument('-n', '--none', action="store_true", help='get none states')
args = parser.parse_args()

columns = ['DP02_0063PE', 'DP02_0063E']
census_data_url = f'https://api.census.gov/data/2019/acs/acs5/profile?get={",".join(columns)}&for=county:*&in=state:*'

def get_data():
    print(census_data_url)
    os.system(f'curl "{census_data_url}" -o sample-csv.txt')
    os.system('''
            ndjson-cat sample-csv.txt \
            | ndjson-split 'd.slice(1)' \
            | ndjson-map '`${d[2]},${d[3]},${d[0]},${d[1]}`'
    ''')
    # sample_csv_ndjson = open('sample-csv.ndjson', 'r')
    # sample_csv = open('sample.csv', 'w')

    # for line in sample_csv_ndjson:
    #     line_json = json.loads(line.replace('\n',''))
    #     if line_json['state_fips'] != '72':
    #         csv_line = f'{line_json["value"]},{line_json["percent"]},{line_json["state_fips"]},{line_json["county_fips"]}\n'
    #         sample_csv.write(csv_line)

    # sample_csv_ndjson.close()
    # sample_csv.close()

def get_none_states():
    sample_csv_file = open('sample.csv', 'r')
    for line in sample_csv_file:
        tokens = line.replace('\n','').split(',')
        any_none = [token == 'None' for token in tokens]
        # print(any_none)
        if any(any_none):
            print(tokens)
    sample_csv_file.close()

if __name__ == '__main__':
    if args.get:
        get_data()
    elif args.none:
        get_none_states()