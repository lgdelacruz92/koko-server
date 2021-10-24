# connect to database and create table
import sqlite3

if __name__ == '__main__':
    conn = sqlite3.connect("koko.db")

    # read text from your input file containing xml
    with open('counties-census-color.svg', 'r') as svg_file:
        xml_string_from_file = svg_file.read()

        # insert text into database
        cur = conn.cursor()
        cur.execute('''insert into svgs(state,svg) values (?,?)''', ('12', xml_string_from_file,))
        conn.commit()