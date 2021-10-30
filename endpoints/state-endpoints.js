const { removeStopWords, resourceNotFound } = require('../modules/utils')

exports.search = {
    route: '/search',
    handler: function (req, res, next, db) {
        const cleanPossibleTags = removeStopWords(req.query.query)
        const tags = `"${cleanPossibleTags.join('","')}"`
        const sqlQuery = [
            'select g.id, title, g.description  from GeographicFeatures as g',
            '\n\tjoin Tag_Feature',
            '\n\tjoin Tags',
            `\n\twhere name in (${tags})`,
            '\n\tgroup by feature_id;',
        ]
        db.query(
            sqlQuery.join(''),
            function (rows) {
                res.status(200).json({ response: rows })
            },
            function (err) {
                res.status(404).json(err)
            }
        )
    },
}

const getSessionData = (db, token) => {
    return new Promise((resolve, reject) => {
        const query = `select * from SessionTokens where token = '${token}'`
        console.log(query)
        db.sql_execute_first(query)
            .then((row) => resolve(row))
            .catch((err) => reject(err))
    })
}

const getStateGeoJSON = (db, stateFips) => {
    return new Promise((resolve, reject) => {
        const query = `select * from StateCountyGeoJsons where state = '${stateFips}'`
        console.log(query)
        db.sql_execute_first(query)
            .then((row) => resolve(row))
            .catch((err) => reject(err))
    })
}

const getCounties = (db, stateFips) => {
    return new Promise((resolve, reject) => {
        const query = `select * from County where state = '${stateFips}'`
        console.log(query)
        db.sql_execute(query)
            .then(rows => resolve(rows))
            .catch(err => reject(err))
    })
}

exports.makeSvg = {
    route: '/make/:fips',
    handler: function (req, res, next, db) {
        const stateFips = req.params.fips
        const sessionToken = req.body.session

        // get the session data
        getSessionData(db, sessionToken)
            .then((dataRow) => {
                dataJson = JSON.parse(dataRow.data)
                dataRow.data = dataJson

                // get the geojson
                getStateGeoJSON(db, stateFips).then((geojsonRow) => {
                    geojson = JSON.parse(geojsonRow.geojson)
                    geojsonRow.geojson = geojson

                    getCounties(db, stateFips).then((counties) => {
                        // transform counties for faster lookup
                        const countyLookup = counties.reduce(
                            (prev, cur) => {
                                prev[cur.fips] = { ...cur };
                                return prev;
                            }, {}
                        )

                        let max_val = 0;
                        // transform data to lookup by fips
                        const countyDataReducer = (prev, cur) => {
                            const countyFips = cur.state_fips + cur.county_fips;
                            if (countyFips in countyLookup) {
                                prev[countyFips] = { ...cur, county_name: countyLookup[countyFips].county_name, state_name: countyLookup[countyFips].state_name }
                                if (parseFloat(cur.percent) > max_val) {
                                    max_val = parseFloat(cur.percent);
                                }
                            }
                            return prev
                        }

                        res.status(200).json({
                            countyData: dataRow.data.data.reduce(countyDataReducer, {}),
                            geojson: geojson,
                            max_val: max_val
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(404).send(resourceNotFound('(county)'));
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(404).send(resourceNotFound('(Geojson)'));
                })
            })
            .catch((err) => {
                console.log(err)
                res.status(404).send(resourceNotFound('(county data)'))
            })
    },
}

exports.getStates = {
    route: '/states',
    handler: function (res, db) {
        db.sql_execute('select state_name as name, fips from state')
            .then((state_rows) => {
                res.status(200).json({ states: state_rows })
            })
            .catch((err) => {
                res.status(404).send(resourceNotFound('States'))
            })
    },
}
