const { green, red } = require('ansicolor');
const pgDb = require('../db-pg');

exports.insertSession = async (session, data) => {
    const query = `insert into session_tokens (token, data) values ('${session}', '${data}')`;
    await pgDb.query(query);
}

exports.getSessionData = (token) => {
    return new Promise((resolve, reject) => {
        const query = `select * from session_tokens where token = '${token}'`
        console.log(green(query));
        pgDb.query_first(query)
            .then(row => resolve(row))
            .catch(err => reject(err))
    })
}

exports.getStateGeoJSON = (db, stateFips) => {
    return new Promise((resolve, reject) => {
        const query = `select * from StateCountyGeoJsons where state = '${stateFips}'`
        console.log(query)
        db.sql_execute_first(query)
            .then((row) => resolve(row))
            .catch((err) => reject(err))
    })
}

exports.getCounties = (db, stateFips) => {
    return new Promise((resolve, reject) => {
        const query = `select * from County where state = '${stateFips}'`
        console.log(query)
        db.sql_execute(query)
            .then(rows => resolve(rows))
            .catch(err => reject(err))
    })
}

exports.getGeoSelections = async id => {
    const query = `select * from geo_selections where id = ${id}`;
    const result = await pgDb.query_first(query);
    return result;
}

exports.processGeoSelection = async geoSelection => {
    const results = await pgDb.query(geoSelection.command);
    return results.rows;
}

exports.getStateFipsFromGeoSelectionId = async geoid => {
    const queryArray = [
        'select * from geo_selections',
        '	join state_geo_selection on geoselection_id = geo_selections.id',
        `	where geo_selections.id = ${geoid};`,
        ];
    const query = queryArray.join('\n');
    const result = await pgDb.query_first(query);
    return result.state_fips;
}


exports.getBestGeoJson = async (feature, state_fips) => {
    const queryArray = [
        'select geojson,',
        '	geojsons.id as geojson_id,',
        '	geo_selections.id as geoselection_id,',
        '	state_geo_selection.state_fips as state_fips',
        'from',
        '    geo_selections join feature_types on feature_types.id = geo_selections.type',
        '    join state_geo_selection on geo_selections.id = state_geo_selection.geoselection_id',
        '	join state_geojson on state_geojson.state_fips = state_geo_selection.state_fips',
        '	join geojsons on geojsons.id = state_geojson.geojson_id',
        `	where feature_types.name = '${feature}' and state_geo_selection.state_fips = '${state_fips}';`,
        ]
    const query = queryArray.join('\n\t');
    const result = await pgDb.query_first(query);
    return result;
}