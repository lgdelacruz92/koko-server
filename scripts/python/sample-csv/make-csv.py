import os

if __name__ == '__main__':
    with open('sample-csv.txt', 'r') as sample_csv:
        for i, line in enumerate(sample_csv):
            if i > 0:
                print(line.replace('\n','').replace('[','').replace(']','')[:-1])
