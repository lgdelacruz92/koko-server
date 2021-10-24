import argparse
# import pprint

parser = argparse.ArgumentParser(description='Data process')
parser.add_argument('-f', '--file', help='Filename for the data', required=True)
parser.add_argument('-t', '--table', help='Table for the data', required=True)

args = parser.parse_args()

if __name__ == '__main__':
    filename = args.file
    with open(filename, 'r') as data_file:
        i = 0
        for line in data_file:
            if i > 0:
                clean_line = line.replace('[[', '').replace('[', '').replace(']', '').replace(']]', '').replace('"','').replace('\n', '')

                dp05_0006pe, state, county = clean_line.split(',') if clean_line[-1] != ',' else clean_line[:-1].split(',')
                print(f'insert into {args.table}(DP05_0006PE, state, county) values("{dp05_0006pe}","{state}","{county}");')
            i += 1