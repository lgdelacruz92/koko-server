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
    getGeoSelectionById,
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
            const geoSelection = await getGeoSelectionById(geoid);
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

exports.geoSelections = {
    route: '/geo',
    handler: async (_, res, next) => {
        try {
            const results = await getGeoSelections();
            res.status(200).json(results);
        }
        catch(err) {
            next(err);
        }
    }
}