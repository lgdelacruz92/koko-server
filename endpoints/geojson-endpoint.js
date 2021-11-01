const { 
    resourceNotFound,
    getSessionDataJson,
    getGeoJson,
    makeCountyLookup,
    makeCountyDataMap,
    formatGeoJson
 } = require('../modules/utils');
const {
    getSessionData,
    getStateFipsFromGeoSelectionId,
    getGeoSelections,
    getBestGeoJson 
} = require('../modules/common-sql');

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
                const state_fips = await getStateFipsFromGeoSelectionId(db, geoid);
                const geoJsonRow = await getBestGeoJson(db, feature, state_fips);
                const geoSelection = await getGeoSelections(db, geoid);
                const geoSelectionResults = await processGeoSelection(db, geoSelection);
                const data = getSessionDataJson(sessionRow);
                const countyLookup = makeCountyLookup(geoSelectionResults);
                const dataMap = makeCountyDataMap(data.data, countyLookup);
                const geoJson = getGeoJson(geoJsonRow);
                const formattedGeoJson = formatGeoJson(geoJson, dataMap.countyDataMap, dataMap.max_val);
                res.status(200).json({ formattedGeoJson, dataMap });
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
        const query = 'select GeoSelections.id as id, title, FeatureTypes.name as type from GeoSelections join FeatureTypes on GeoSelections.type = FeatureTypes.id';
        console.log(query);
        let geoSelections = await db.sql_execute(query);
        if (geoSelections.length > 2) {
            const lastGeo = geoSelections[geoSelections.length - 1];
            geoSelections.splice(geoSelections.length - 1, 1);
            geoSelections = [lastGeo].concat(geoSelections);    
        }
        res.status(200).json(geoSelections);
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