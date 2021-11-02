const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000
const db = require('./db');
const stateEndpoints = require('./endpoints/state-endpoints');
const dataEndpoints = require('./endpoints/data-endpoints');
const geojsonEndpoints = require('./endpoints/geojson-endpoint');

python = '/usr/local/bin/python3'
cwd = process.cwd()


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

/*
    State routes
*/
app.get(stateEndpoints.search.route, cors(corsOptions), (req, res, next) => stateEndpoints.search.handler(req, res, next, db));
app.post(stateEndpoints.makeSvg.route, cors(corsOptions), (req, res, next) => stateEndpoints.makeSvg.handler(req, res, next, db));
app.get(stateEndpoints.getStates.route, cors(corsOptions), (req, res, next) => stateEndpoints.getStates.handler(res, db));

/*
    Data routes
*/
app.post(dataEndpoints.use.route, cors(corsOptions), (req, res, next) => dataEndpoints.use.handler(req, res, next, db));
app.get(dataEndpoints.legend.route, cors(corsOptions), (req, res) => dataEndpoints.legend.handler(req, res, db));

/*
    GeoJSON endpoints
*/
app.get(geojsonEndpoints.geojson.route, cors(corsOptions), (req, res, next) => geojsonEndpoints.geojson.handler(req, res, next, db));
app.get(geojsonEndpoints.geoSelections.route, cors(corsOptions), (req, res, next) => geojsonEndpoints.geoSelections.handler(res, db));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
