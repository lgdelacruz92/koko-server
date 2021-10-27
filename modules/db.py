import sqlite3
import os
        
class Rows:
    def __init__(self, rows=[]):
        self.rows = rows
    
    def first(self):
        if (self.rows) == 0:
            raise ValueError('Rows are empty.')
        return self.rows[0]
    
    def all(self):
        return self.rows

def execute(query):
    # connect to db
    con = sqlite3.connect(os.environ.get('KOKO_SERVER_HOST'))
    cur = con.cursor()

    rows = cur.execute(query)
    result = Rows(rows=[row for row in rows])
    con.commit()
    con.close()
    return result