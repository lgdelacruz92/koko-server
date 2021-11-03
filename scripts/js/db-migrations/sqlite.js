const sqlite3 = require('sqlite3').verbose()
const { Client } = require('pg')
require('dotenv').config()

const pgClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

const query = (query) => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database('koko.db');
        db.serialize(function () {
            db.all(query, function (err, row) {
                if (err) {
                    reject(err);
                    return
                }
                resolve(row);
            })
        })
        db.close()
    })
}

const pgQuery = async (query) => {
    try {
        await pgClient.connect()
        const result = await pgClient.query(query)
        pgClient.end();
        return result.rows;
    }
    catch(err) {
        console.log(err);
    }
}

const getSqlRowKeys = sqlResults => {
    if (sqlResults.length > 0) {
        return Object.keys(sqlResults[0]);
    }
    throw new Error('sqlResults is empty');
}
const main = async () => {
    const sqlResults = await query('select * from SessionTokens');
    const sqlResultColumns = getSqlRowKeys(sqlResults);

    sqlResults.forEach(async s => {
        const query = `INSERT INTO session_tokens (token, data) VALUES ('${s.token}', '${s.data}')`
        try {
            const pgResults = await pgQuery(query);
            console.log(pgResults);
        }
        catch (err) {
            throw new Error(err);
        }
    })
}

main()