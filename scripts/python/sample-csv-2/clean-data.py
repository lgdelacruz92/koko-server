import argparse

parser = argparse.ArgumentParser(description='Clean csv')
parser.add_argument('-n', '--name', help='File name', required=True)
args = parser.parse_args()

if __name__ == "__main__":
    filename = args.name
    csvfile = open(filename, 'r')
    for line in csvfile:
        if 'null' not in line:
            clean_line = line.rstrip().replace('"','')
            print(clean_line)