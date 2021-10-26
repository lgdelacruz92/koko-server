import sqlite3
import json

if __name__ == '__main__':
    # connect to db
    con = sqlite3.connect('../../../koko.db')
    cur = con.cursor()

    # open file
    data_json = json.load(open('data.json', 'r'))
    # print(data_json)

    #insert into SessionTokens(token, data) values("${sessionToken}",'${JSON.stringify(req.body)}');`
    cur.execute(f'insert into SessionTokens(token, data) values("unique_id", \'{json.dumps(data_json)}\')')
    con.commit()
    con.close()