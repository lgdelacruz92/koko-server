const { 
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
    getBestGeoJson,
    processGeoSelection
} = require('../modules/common-sql');



exports.geojson = {
    route: '/geo/:feature/geoid/:geoid/session/:token',

    /**
     * Gets geojson for request
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns { formattedGeoJson, dataMap }
     */
    handler: async (req, res, next) =>  {
        const token = req.params.token;
        const feature = req.params.feature;
        const geoid = req.params.geoid;
        try {
            const sessionRow = await getSessionData(token);
            const state_fips = await getStateFipsFromGeoSelectionId(geoid);
            const geoJsonRow = await getBestGeoJson(feature, state_fips);
            const geoSelection = await getGeoSelections(geoid);
            const geoSelectionResults = await processGeoSelection(geoSelection);
            const data = getSessionDataJson(sessionRow);
            const countyLookup = makeCountyLookup(geoSelectionResults);
            const dataMap = makeCountyDataMap(data.data, countyLookup);
            const geoJson = getGeoJson(geoJsonRow);
            const formattedGeoJson = formatGeoJson(geoJson, dataMap.countyDataMap, dataMap.max_val);
            res.status(200).json({ formattedGeoJson, dataMap });
        }
        catch (err) {
            next(err);
        }
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