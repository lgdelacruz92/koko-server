const { resourceNotFound } = require('../modules/utils');
const { getSessionData, getUSGeoJSON, getGeoSelections } = require('../modules/common-sql');

exports.geojson = {
    route: '/geo/:feature/scale/:scale/session/:token',
    handler: function(req, res, next, db) {
        const getGeo = async (req, res, db) => {
            const token = req.params.token;
            const feature = req.params.feature;
            const scale = req.params.scale;
            try {
                const sessionRow = await getSessionData(db, token);
                const usGeoJson = await getUSGeoJSON(db, feature);
                const geoSelections = await getGeoSelections(db, scale);
                res.status(200).json({ sessionRow, usGeoJson, geoSelections });
            }
            catch (err) {
                res.status(404).send(resourceNotFound());
            }
        }

        getGeo(req, res, db);
    }
}