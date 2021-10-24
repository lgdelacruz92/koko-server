# Reads fips.csv to create an insert sql command

if __name__ == '__main__':
    with open('fips.csv', 'r') as fips_file:
        for line in fips_file:
            fips, county_name, _ = line.split(',')
            fips = f'0{fips}' if len(fips) < 5 else fips
            # insert_query = f'insert into temp_table(state, county, county_name) values("{fips[:2]}", "{fips[2:]}", "{county_name}");'
            # print(insert_query)
            update_query = f'update Group5\n\tset county_name = "{county_name}" where state = "{fips[:2]}" and county = "{fips[2:]}";'
            print(update_query)