import sqlite3
import os
import pprint

def get_csv():
    county_file = open('county.csv', 'r')
    return county_file.readlines()

def insert_count():
    rows = get_csv()

    conn = sqlite3.connect('../../../koko.db')
    cur = conn.cursor()

    cur.execute('drop table if exists County')

    labels = rows[0] # first one is names of the columns
    label_items = labels.replace('\n','').split(',')

    column_labels = ''
    for i, item in enumerate(label_items):
        column_labels += item + ' text'
        column_labels += (',\n' if i != len(label_items)-1 else '\n')

    cur.execute('''
        create table County(
            id integer primary key autoincrement,
            %s)
        ''' % column_labels
    )

    for row in rows[1:]:
        tokens = row.replace('\n','').split(',')
        fips = tokens[0] if len(tokens[0]) == 5 else f'0{tokens[0]}'

        if tokens[8] == 'NA' or tokens[9] == 'NA':
            continue

        state = tokens[8] if len(tokens[8]) == 2 else f'0{tokens[8]}'
        county = ''.join(['0' for i in range(3 - len(tokens[9]))]) + tokens[9]

        tokens[0] = fips
        tokens[8] = state
        tokens[9] = county
        print(tokens)

        values = '"' + '","'.join(tokens) + '"'
        query = '''
            insert into County(%s) values(%s)
        ''' % (','.join(label_items), values)
        print(query)
        cur.execute(query)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    insert_count()