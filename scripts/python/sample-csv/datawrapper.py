if __name__ == "__main__":
    county_fips_file = open('county-fips.csv', 'r')
    county_map = {}
    for line in county_fips_file:
        tokens = line.replace('\n','').split(',')
        fips = tokens[0]
        fips = fips if len(fips) == 5 else f'0{fips}'
        county_map[fips] = {
            'state': tokens[3],
            'county': tokens[1]
        }
    with open('sample.csv', 'r') as csv_viewer:
        for line in csv_viewer:
            tokens = line.replace('\n','').split(',')
            # print(tokens)
            fips = tokens[2] + tokens[3]
            if fips in county_map:
                print(f'{fips},{tokens[0]},{tokens[1]},{county_map[fips]["state"]},{county_map[fips]["county"]}')