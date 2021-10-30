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
