const { Pool } = require('pg')
require('dotenv').config()
const { green, red } = require('ansicolor');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
})

exports.query = async query => {
    return new Promise(async (resolve, reject) => {
        console.log(green(query));
        try {
            const result = await pool.query(query);
            resolve(result);
        }
        catch (err) {
            console.log(red(err));
            reject(err);
        }
    });
}