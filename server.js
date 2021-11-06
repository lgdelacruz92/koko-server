const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
const stateEndpoints = require('./endpoints/state-endpoints');
const dataEndpoints = require('./endpoints/data-endpoints');
const geojsonEndpoints = require('./endpoints/geojson-endpoint');
const pgDb = require('./db-pg');
require('dotenv').config()

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:6006']
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
    limit: '50mb',
    extended: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/ping', (req, res) => res.send('Success'));

app.get('/query', async (req, res) => {
    try {
        const result = await pgDb.query('select * from feature_types');
        res.status(200).json(result);
    }
    catch(err) {
        res.status(404).send(err);
    }
})

/*
    State routes
*/
app.get(stateEndpoints.getStates.route, cors(corsOptions), stateEndpoints.getStates.handler);

/*
    Data routes
*/
app.post(dataEndpoints.use.route, cors(corsOptions), dataEndpoints.use.handler);
app.post(dataEndpoints.session_token_metadata.route, cors(corsOptions), dataEndpoints.session_token_metadata.handler);
app.post(dataEndpoints.makeDefaultSession.route, cors(corsOptions), dataEndpoints.makeDefaultSession.handler);
app.post(dataEndpoints.emailRequest.route, cors(corsOptions), dataEndpoints.emailRequest.handler);

app.get(dataEndpoints.get_session_token_metadata.route, cors(corsOptions), dataEndpoints.get_session_token_metadata.handler);
app.get(dataEndpoints.legend.route, cors(corsOptions), dataEndpoints.legend.handler);


/*
    GeoJSON endpoints
*/
app.get(geojsonEndpoints.geojson.route, cors(corsOptions), geojsonEndpoints.geojson.handler);
app.get(geojsonEndpoints.geoSelections.route, cors(corsOptions), geojsonEndpoints.geoSelections.handler);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
