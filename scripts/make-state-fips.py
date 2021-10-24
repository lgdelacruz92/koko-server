if __name__ == "__main__":
    with open('state-fips.csv', 'r') as state_csv:
        for line in state_csv:
            values = line.split(',')
            fips = values[3] if len(values[3]) == 2 else f'0{values[3]}'
            state = values[7] if len(values[7]) == 2 else f'0{values[7]}'

            values_part = f'values("{values[0]}","{values[1]}","{values[2]}","{fips}","{values[4]}","{values[5]}","{values[6]}","{state}","{values[8]}","{values[9]}");'
            print('\n\t'.join([
                'insert into state(state_name,state_abbr,long_name,fips,sumlev,region,division,state,region_name,division_name)',
                values_part
            ]))