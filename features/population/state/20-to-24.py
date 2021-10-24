import sqlite3

if __name__ == '__main__':
    con = sqlite3.connect('koko.db')
    cur = con.cursor()
    rows = cur.execute(f'select * from Group5 where state = "12"')
    for row in rows:
        print(row)