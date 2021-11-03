const sqlite3 = require('sqlite3').verbose()
const { Pool } = require('pg')
require('dotenv').config()

const pgPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
})

const query = (query) => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database('koko.db')
        db.serialize(function () {
            db.all(query, function (err, row) {
                if (err) {
                    reject(err)
                    return
                }
                resolve(row)
            })
        })
        db.close()
    })
}

const pgQuery = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await pgPool.connect()
            await client.query(query)
            client.release();
            resolve();
        }
        catch (err) {
            reject(err);
        }
    })
}

const getSqlRowKeys = (sqlResults) => {
    if (sqlResults.length > 0) {
        return Object.keys(sqlResults[0])
    }
    throw new Error('sqlResults is empty')
}

const makePgSql = (columns, specifics, ignoreSet) => {
    return columns.map((c) => {
        if (ignoreSet.has(c)) {
            console.log(`ignored '${c}'`)
            return ''
        }
        if (c in specifics) {
            return `${c} ${specifics[c]}`
        }
        return `${c} text`
    })
}

const getSqlRowValues = (columns, row) => {
    return columns.map(c => {
        if (row[c].includes("'")) {
            return row[c].replace("'", '\'\'');
        }
        return row[c];
    });
}

const main = async () => {
    const tableMap = ['GeoSelections', 'geo_selections'];
    const sqlResults = await query(`select * from ${tableMap[0]}`)
    let sqlResultColumns = getSqlRowKeys(sqlResults)

    sqlResults.forEach(async (s, i) => {
        // const cleanApposGeojson = s.geojson.replace(/'/gu, '\'\'');
        const query = `INSERT INTO ${tableMap[1]} (command, title, type, scale) VALUES ('${s.command}','${s.title}', ${s.type}, ${s.scale})`
        console.log(query)
        try {
            // console.log(i, sqlResults[i].fips, query)
            await pgQuery(query)
            console.log(i, s.id, 'done')
        }
        catch (err) {
            console.error(err)
        }
    })
}

main()

// console.log(getSqlRowValues(['a', 'a'], { "a": "O'Brien", "b": "Test"}))