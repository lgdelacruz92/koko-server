import os



if __name__ == '__main__':
    os.system('curl "https://api.census.gov/data/2019/acs/acs5/profile?get=DP05_0006E,DP05_0006PE&for=county:*&in=state:*" -o sample-csv.txt')
    os.system('''
            ndjson-cat sample-csv.txt \
            | ndjson-split 'd.slice(1)' \
            | ndjson-map '{value: d[0], percent: d[1], state_fips: d[2], county_fips: d[3]}' \
            > sample-csv.ndjson
    ''')
    os.system('python3 data-map.py -f sample-csv.ndjson')