const { Pool } = require('pg')
require('dotenv').config()
const { green } = require('ansicolor');
const { ResourceNotFound } = require('./modules/errors');
const { cleanString, quote } = require('./modules/utils');

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
    const queryMessage = query.length < QUERY_MESSAGE_LIMIT ? query : query.substring(0, QUERY_MESSAGE_LIMIT) + '...';
    console.log(green(queryMessage));
    const results = await pool.query(query.trim());
    return results;
}

exports.query_first = async query => {
    const result = await pool.query(query);
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        throw ResourceNotFound(query);
    }
}

exports.insert = async (table, columns, values) => {
    const columnNames = columns.join(',');
    const cleanValues = values.map(value => value.type === 'string' ? `'${cleanString(value.value)}'` : `'${value.value}'`);
    const insertQuery = `insert into ${table} (${columnNames}) values (${cleanValues.join(',')})`;

    await pool.query(insertQuery);
}

exports.update = async (table, column, value, identifier) => {
    const cleanValue = value.type === 'string' ? `'${cleanString(value.value)}'` : `'${value.value}'`
    const cleanIdentifierValue = identifier.value.type === 'string' ? quote(cleanString(identifier.value.value)) : quote(identifier.value.value);
    const updateQuery = `
        update ${table}
        set ${column} = ${cleanValue}
        where ${identifier.column} = ${cleanIdentifierValue}
    `;
    await pool.query(updateQuery);
}