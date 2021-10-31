if __name__ == "__main__":
    with open('input.txt', 'r') as input_file:
        for line in input_file:
            tokens = line.replace('\t', ' ').replace('\n', '').split(' ')
            sql_command = f'insert into State_GeoSelection(geoselection_id, state_fips) values({tokens[0]},{tokens[-1]});'
            print(sql_command)