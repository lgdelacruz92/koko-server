const { Pool } = require('pg')
require('dotenv').config()
const { green, red } = require('ansicolor');
const { ResourceNotFound } = require('./modules/errors');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
})

const QUERY_MESSAGE_LIMIT = 100;

exports.query = async query => {
    return new Promise(async (resolve, reject) => {
        const queryMessage = query.length < QUERY_MESSAGE_LIMIT ? query : query.substring(0, QUERY_MESSAGE_LIMIT) + '...';
        console.log(green(queryMessage));
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

exports.query_first = async query => {
    return new Promise(async (resolve, reject) => {
        console.log(green(query));
        try {
            const result = await pool.query(query);
            if (result.rows.length > 0) {
                resolve(result.rows[0]);
            } else {
                reject(ResourceNotFound(query))
            }
        }
        catch (err) {
            console.log(red(err));
            reject(err);
        }
    });
}