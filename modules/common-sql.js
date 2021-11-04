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

exports.getGeoSelections = (db, id) => {
    return new Promise((resolve, reject) => {
        const query = `select * from GeoSelections where id = ${id}`;
        console.log(query)
        db.sql_execute_first(query)
            .then(row => resolve(row))
            .catch(err => reject(err))
    })
}

exports.getStateFipsFromGeoSelectionId = (db, geoid) => {
    return new Promise((resolve, reject) => {
        const queryArray = [
            'select * from GeoSelections',
            '	join State_GeoSelection on State_GeoSelection.geoselection_id = GeoSelections.id',
            `	where GeoSelections.id = ${geoid};`,
            ];
        const query = queryArray.join('\n');
        console.log(query);
        db.sql_execute_first(query)
            .then(row => resolve(row.state_fips))
            .catch(err => reject(err))
    })
}


exports.getBestGeoJson = (db, feature, state_fips) => {
    return new Promise((resolve, reject) => {
        const queryArray = [
            'select geojson,',
            '	GeoJSONs.id as geojson_id,',
            '	GeoSelections.id as geoselection_id,',
            '	State_GeoSelection.state_fips as state_fips',
            'from',
            '    GeoSelections join FeatureTypes on FeatureTypes.id = GeoSelections.type',
            '    join State_GeoSelection on GeoSelections.id = State_GeoSelection.geoselection_id',
            '	join State_GeoJson on State_GeoJson.state_fips = State_GeoSelection.state_fips',
            '	join GeoJSONs on GeoJSONs.id = State_GeoJson.geojson_id',
            `	where FeatureTypes.name = '${feature}' and State_GeoSelection.state_fips = '${state_fips}';`,
            ]
        const query = queryArray.join('\n\t');
        console.log(query)
        db.sql_execute_first(query)
            .then(row => resolve(row))
            .catch(err => reject(err))
    })
}