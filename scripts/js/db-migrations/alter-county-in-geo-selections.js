const { Pool } = require('pg')
require('dotenv').config()
const { green, red } = require('ansicolor');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const pgPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false },
})

const query = async query => {
    try {
        const queryMessage = query.length < 100 ? query : query.substring(0, 100);
        console.log(green(queryMessage))

        const client = await pgPool.connect()
        const results = await client.query(query)
        client.release();
        return results;
    }
    catch(err) {
        console.log(red(err));
    }
}

const update = async (id, newCommand) => {
    const pgQuery = [
        'update geo_selections\n\t',
        `set command = '${newCommand}\n\t'`,
        `where geo_selections.id = ${id}`
    ];
    await query(pgQuery.join(''));
}

const main = async () => {
    if (argv.alter_county) {
        const results = await query(`select * from geo_selections`);
        const commands = results.rows.map(result => ({id: result.id, command: result.command }));
        commands.forEach(async command => {
            try {
                const newCommand = command.command.trim().replace('County', 'counties').replace(/["]/gu, "\'\'");
                await update(command.id, newCommand);
                console.log(green(`(${command.command}) changed to (${newCommand})`));
            }
            catch (err) {
                console.log(red(err));
            }
        })
    }
}

main();