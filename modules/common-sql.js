const { green, red } = require('ansicolor');
const pgDb = require('../db-pg');

exports.insertSession = async (session, data) => {
    const query = `insert into session_tokens (token, data) values ('${session}', '${data}')`;
    await pgDb.query(query);
}

exports.getSessionData = async token => {
    const query = `select * from session_tokens where token = '${token}'`
    console.log(green(query));
    const result = await pgDb.query_first(query);
    return result;
}

exports.getGeoSelections = async () => {
    const query = 'select geo_selections.id as id, title, feature_types.name as type from geo_selections join feature_types on geo_selections.type = feature_types.id';
    const geoSelections = await pgDb.query(query);
    let selectionRows = geoSelections.rows;
    if (selectionRows.length > 2) {
        const lastGeo = selectionRows[selectionRows.length - 1];
        selectionRows.splice(selectionRows.length - 1, 1);
        selectionRows = [lastGeo].concat(selectionRows);    
    }
    return selectionRows;
}

exports.getGeoSelectionById = async id => {
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