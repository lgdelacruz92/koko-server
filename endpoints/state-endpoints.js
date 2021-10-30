const { removeStopWords, resourceNotFound } = require('../modules/utils');

exports.search = {
    route: '/search',
    handler: function (req, res, next, db) {
        const cleanPossibleTags = removeStopWords(req.query.query);
        const tags = `"${cleanPossibleTags.join('","')}"`;
        const sqlQuery = [
            'select g.id, title, g.description  from GeographicFeatures as g',
            '\n\tjoin Tag_Feature',
            '\n\tjoin Tags',
            `\n\twhere name in (${tags})`,
            '\n\tgroup by feature_id;'
        ];
        db.query(sqlQuery.join(''), function(rows) {
            res.status(200).json({ response: rows })
        }, function(err) {
            res.status(404).json(err);
        });
    }
}

const getSessionData = (db, token) => {
    return new Promise((resolve, reject) => {
        const query = `select * from SessionTokens where token = '${token}'`;
        console.log(query);
        db.sql_execute_first(query)
            .then(row => resolve(row))
            .catch(err => reject(err));
    })
}

const getStateGeoJSON = (db, fips) => {
    return new Promise((resolve, reject) => {
        const query = `select * from StateCountyGeoJsons where state = '${fips}'`;
        console.log(query);
        db.sql_execute_first(query)
            .then(row => resolve(row))
            .catch(err => reject(err));
    })
}

exports.makeSvg = {
    route: '/make/:fips',
    handler: function(req, res, next, db) {
        const fips = req.params.fips;
        const sessionToken = req.body.session;
        getSessionData(db, sessionToken)
            .then(dataRow => {
                dataJson = JSON.parse(dataRow.data);
                dataRow.data = dataJson;
                getStateGeoJSON(db, fips)
                    .then(geojsonRow => {
                        geojson = JSON.parse(geojsonRow.geojson);
                        geojsonRow.geojson = geojson;

                        const reducer = (prev, cur) => {
                            prev[cur.state_fips + cur.county_fips] = { ...cur };
                            return prev;
                        }

                        res.status(200).json({
                            data: dataRow.data.data.reduce(reducer, {}),
                            geojson: geojson
                        });
                    })
            })
            .catch(err => {
                console.log(err);
                res.status(404).send(resourceNotFound())
            })
    }
}

exports.getStates = {
    route: '/states',
    handler: function(res, db) {
        db.sql_execute('select state_name as name, fips from state')
            .then(state_rows => {
                res.status(200).json({ states: state_rows }) 
            })
            .catch(err => {
                res.status(404).send(resourceNotFound('States'));
            })
        
    }
}