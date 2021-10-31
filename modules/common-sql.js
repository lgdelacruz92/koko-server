exports.getSessionData = (db, token) => {
    return new Promise((resolve, reject) => {
        const query = `select * from SessionTokens where token = '${token}'`
        console.log(query)
        db.sql_execute_first(query)
            .then((row) => resolve(row))
            .catch((err) => reject(err))
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


exports.getUSGeoJSON = (db, feature) => {
    return new Promise((resolve, reject) => {
        const queryArray = [
            'select GeoJSONs.id as geojson_id, FeatureTypes.id as feature_types_id, geojson from GeoJSONs\n\t',
            'join FeatureTypes on FeatureTypes.id = GeoJSONs.type\n\t',
            `where GeoJSONs.id = 123 and FeatureTypes.name = "${feature}"`];
        const query = queryArray.join('');
        console.log(query)
        db.sql_execute_first(query)
            .then(row => resolve(row))
            .catch(err => reject(err))
    })
}