const { resourceNotFound } = require('../modules/utils');
const { getSessionData, getUSGeoJSON } = require('../modules/common-sql');

exports.geojson = {
    route: '/geo/:feature/param/:param/session/:token',
    handler: function(req, res, next, db) {
        const token = req.params.token;
        const feature = req.params.feature;
        const param = req.params.param;

        // get session
        getSessionData(db, token)
            .then(sessionRow => {

                // get US geojson
                getUSGeoJSON(db)
                    .then(usGeoJsonRow => {

                        res.status(200).json({ sessionRow, usGeoJsonRow });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(404).send(resourceNotFound('(US GeoJSON)'));
                    })
            })
            .catch(err => {
                res.status(404).send(resourceNotFound('(Session)'));
            })
    }
}