const { removeStopWords, resourceNotFound, formatGeoJson } = require('../modules/utils');
const { getSessionData, getStateGeoJSON, getCounties } = require('../modules/common-sql');

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
                        // county lookup
                        const countyLookup = makeCountyLookup(counties);

                        // county data map
                        const result = makeCountyDataMap(data, countyLookup);
                        const countyDataMap = result.countyDataMap;
                        const max_val = result.max_val;
                        const formattedGeoJson = formatGeoJson(geojson, countyDataMap, max_val);

                        res.status(200).json({
                            formattedGeoJson
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
