const { 
    resourceNotFound,
    getSessionDataJson,
    getGeoJson,
    makeCountyLookup,
    makeCountyDataMap,
    formatGeoJson
 } = require('../modules/utils');
const { getSessionData, getUSGeoJSON, getGeoSelections } = require('../modules/common-sql');

const processGeoSelection = (db, geoSelection) => {
    return new Promise((resolve, reject) => {
        console.log(geoSelection.command);
        db.sql_execute(geoSelection.command)
            .then(geoResults => {
                resolve(geoResults);
            })
            .catch(err => {
                console.log(err);
                reject(resourceNotFound());
            })
    })
}

exports.geojson = {
    route: '/geo/:feature/geoid/:geoid/session/:token',
    handler: function(req, res, next, db) {
        const getGeo = async (req, res, db) => {
            const token = req.params.token;
            const feature = req.params.feature;
            const geoid = req.params.geoid;
            try {
                const sessionRow = await getSessionData(db, token);
                const usGeoJson = await getUSGeoJSON(db, feature);
                const geoSelection = await getGeoSelections(db, geoid);
                const geoSelectionResults = await processGeoSelection(db, geoSelection);
                const data = getSessionDataJson(sessionRow);
                const countyLookup = makeCountyLookup(geoSelectionResults);
                const dataMap = makeCountyDataMap(data.data, countyLookup);
                const geoJson = getGeoJson(usGeoJson);
                const formattedGeoJson = formatGeoJson(geoJson, dataMap.countyDataMap, dataMap.max_val);
                res.status(200).json({ formattedGeoJson });
            }
            catch (err) {
                res.status(404).send(resourceNotFound());
            }
        }

        getGeo(req, res, db);
    }
}

const listGeoSelections = async (db, res) => {
    try {
        const query = 'select * from GeoSelections';
        console.log(query);
        const geoSelections = await db.sql_execute(query);
        res.status(200).json(geoSelections.map(g => ({ id: g.id, title: g.title })));
    }
    catch (err) {
        res.status(404).send(resourceNotFound('(GeoSelections)'));
    }
}

exports.geoSelections = {
    route: '/geo',
    handler: function (res, db) {
        listGeoSelections(db,res);
    }
}