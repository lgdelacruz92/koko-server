const sqlite3 = require('sqlite3').verbose()
const { Pool } = require('pg')
require('dotenv').config()
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



const getSqlRowValues = (columns, row) => {
    return columns.map(c => {
        if (row[c].includes("'")) {
            return row[c].replace("'", '\'\'');
        }
        return row[c];
    });
}

const getSqliteTableInfo = async tableName => {
    const sqliteTableInfo = await query(`pragma table_info(${tableName.sqlite})`);
    const sqliteTableInfoMap = sqliteTableInfo.reduce((prev, cur) => {
        prev[cur.name] = { ...cur };
        return prev;
    }, {})
    return sqliteTableInfoMap;
}

const assignPgTypes = (columns, sqliteTableInfo, foreignKeyDefinitions, tableDependency, overrides, specifics, ignoreSet) => {
    return columns.map((c) => {
        if (ignoreSet && ignoreSet.has(c)) {
            return ''
        }
        if (specifics && c in specifics) {
            return `${c} ${specifics[c]}`
        }

        let reference = '';
        if (c in foreignKeyDefinitions) {
            reference = ' ' + makeForeignKeyColumn(c, foreignKeyDefinitions, tableDependency);
        }
        let columnType = sqliteTableInfo[c].type;
        if (overrides && overrides.type) {
            if (c in overrides.type) {
                columnType = overrides.type[c];
            }
        }
        if (sqliteTableInfo[c].pk === 1) {
            columnType = 'serial primary key unique';
        }
        return `${c} ${columnType}${reference}`;
    })
}

const createPgTable = async (pgTableName, columnNames, sqliteTableInfo, foreignKeyDefinitions, tableDependency, overrides) => {
    const columnWithSqliteType = assignPgTypes(columnNames, sqliteTableInfo, foreignKeyDefinitions, tableDependency, overrides);
    const query1 = `drop table if exists ${pgTableName}`;
    await pgQuery(query1);

    const query2 = `create table ${pgTableName} (${columnWithSqliteType.join(',\n\t')});`
    await pgQuery(query2);
    console.log(`table created ${pgTableName}`);
}

const joinValues = cleanValues => {
    return `${cleanValues.join(',')}`;
}

const makeInsertQuery = (pgTableName, columnNamesString, valuesString) => {
    return `insert into ${pgTableName} (${columnNamesString}) values (${valuesString})`;
}

const insertIntoPgTable = async (row, pgTableName, sqliteTableInfo) => {
    const cleanValues = cleanStrings(row, sqliteTableInfo);

    const columnNamesString = Object.keys(row).join(',');
    const valuesString = joinValues(cleanValues);
    const query = makeInsertQuery(pgTableName, columnNamesString, valuesString);
    await pgQuery(query);
}

const makeForeignKeyColumn = (columnName, foreignKeyMap, tableDependency) => {
    if (columnName in foreignKeyMap) {
        if (!tableDependency) {
            throw new Error('No table dependency provided.');
        }
        const table = tableDependency[foreignKeyMap[columnName].table];
        const to = foreignKeyMap[columnName].to;
        return `references ${table} (${to})`;
    }
    return '';
}

const getForeignKeyDefinitions = async tableName => {
    const foreignKeyDefinitions = await query(`pragma foreign_key_list(${tableName.sqlite})`);
    return foreignKeyDefinitions.reduce((prev, cur) => {
        prev[cur.from] = {...cur};
        return prev;
    }, {})
}

const main = async (params) => {
    const tableName = params.tableName;
    const tableDependency = params.tableDependency;
    const overrides = params.overrides;
    const sqliteResults = await query(`select * from ${tableName.sqlite}`);
    const sqliteTableInfo = await getSqliteTableInfo(tableName);
    const foreignKeyDefinitions = await getForeignKeyDefinitions(tableName);

    /** uncomment to make create table for the columns */
    const columnNames = getSqlRowKeys(sqliteResults);
    await createPgTable(tableName.pg, columnNames, sqliteTableInfo, foreignKeyDefinitions, tableDependency, overrides);

    sqliteResults.forEach(async (row, i) => {
        try {
            await insertIntoPgTable(row, tableName.pg, sqliteTableInfo);
            console.log(i, 'finished')
        }
        catch (err) {
            console.log(i, row[i], 'error');
            console.log(err);
        }
    })

}

const assert = (a, b) => {
    if (a !== b) {
        console.log(`${a} !== ${b}`);
    }
    else {
        console.log('Pass')
    }
}

const testColumns2 = ['column_1', 'column_2', 'column_3'];

const testTableInfo = { 
    'column_1': {
        type: 'text'
    },
    'column_2': {
        type: 'text'
    },
    'column_3': {
        type: 'integer'
    }
}

const cleanStrings = (row, tableInfo) => {
    const columnNames = Object.keys(row);
    return columnNames.map(c => {
        if (tableInfo[c].type === 'text') {
            let result = row[c];
            if (result.includes('\'')) {
                result = result.replace(/[']/gu,'\'\'');
            }
            return `\'${result}\'`
        }
        else if (tableInfo[c].type === 'integer') {
            return parseInt(row[c]);
        }
        return row[c];
    });

}

const expected2 = ['\'O\'\'Brien\'', '\'Tim\'', 2];
const testCleanStrings = () => {
    const row = { column_1: 'O\'Brien', column_2: 'Tim', column_3: '2' };
    const result = cleanStrings(row, testTableInfo);
    assert(JSON.stringify(expected2), JSON.stringify(result))
}

const testJoinValues = () => {
    const result = joinValues(expected2);
    assert('\'O\'\'Brien\',\'Tim\',2', result);
}

const testMakeInsertQuery = () => {
    const row = { column_1: 'O\'Brien', column_2: 'Tim', column_3: '2' };

    const cleanValues = cleanStrings(row, testTableInfo);
    const valueStrings = joinValues(cleanValues);
    const columnNamesString = `${testColumns2.join(',')}`;

    const result = makeInsertQuery('state', columnNamesString, valueStrings);
    const expected = 'insert into state (column_1,column_2,column_3) values (\'O\'\'Brien\',\'Tim\',2)';
    assert(expected, result);
}

const tests = () => {
    testCleanStrings();
    testJoinValues();
    testMakeInsertQuery();
}

if (argv.test) {
    tests();
}
else if (argv.inspect) {

    // getForeignKeyDefinitions({ sqlite: 'State_GeoSelection' })
    //     .then(result => {
    //         console.log(result);
    //     })

    const result = makeForeignKeyColumn('column_1', { 
        column_1: {
            id: 0,
            seq: 0,
            table: 'Table',
            from: 'column_1',
            to: 'id',
        }
    });
    console.log(result);
}
else if (argv.geojson) {
    const params = {
        tableName: { sqlite: 'GeoJSONs', pg: 'geojsons' },
        tableDependency: { FeatureTypes: 'feature_types' },
        overrides: {
            type: {
                type: 'integer'
            }
        }
    }
    main(params);
}
else if (argv.state_geojson) {
    const params = {
        tableName: { sqlite: 'State_GeoJson', pg: 'state_geojson' },
        tableDependency: { GeoJSONs: 'geojsons' },
        overrides: null
    }
    main(params);
}
else if (argv.state_geo_selection) {
    const params = {
        tableName: { sqlite: 'State_GeoSelection', pg: 'state_geo_selection' },
        tableDependency: { GeoSelections: 'geo_selections' },
        overrides: null
    }
    main(params);
}
else if (argv.geo_selections) {
    const params = {
        tableName: { sqlite: 'GeoSelections', pg: 'geo_selections' },
        tableDependency: { FeatureTypes: 'feature_types', Scale: 'scale' },
        overrides: null
    }
    main(params);
}