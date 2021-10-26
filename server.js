const express = require('express')
const cors = require('cors')
const app = express()
const port = 5000
const db = require('./db');
const stateEndpoints = require('./endpoints/state-endpoints');
const dataEndpoints = require('./endpoints/data-endpoints');

python = '/usr/local/bin/python3'
cwd = process.cwd()

var corsOptions = {
    origin: 'http://localhost:3000',
}

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.get('/svgs', cors(corsOptions), (req, res) => {
    const query1 = 'select * from Group5';
    const query2 = 'select * from svgs where state = "*"';
    const queries = [query1, query2];
    const recurse = (rows, i, accumulator) => {
        if (i >= rows.length) {
            const response = { data: accumulator[0], svg: accumulator[1][0] };
            res.status(200).json(response);
            return;
        }
        db.query(rows[i], function(rows2) {
            accumulator.push(rows2);
            recurse(rows, i+1, accumulator);
        }, function(err) {
            accumulator.push(err);
            recurse(rows, i+1, accumulator);
        });
    }
    recurse(queries, 0, []);
})

app.get('/svgs/:id', cors(corsOptions), (req, res) => {
    const query = `select * from FeatureQueries where id  = ${req.params.id};`

    db.query(query, function(rows) {
        if (rows.length > 0) {
            const recurse = (rows, i, accumulator) => {
                if (i >= rows.length) {
                    const response = {
                        data: accumulator[0],
                        svg: accumulator[1][0]
                    }
                    res.status(200).json(response);
                    return;
                }
                db.query(rows[i].query, function(rows2) {
                    accumulator.push(rows2);
                    recurse(rows, i+1, accumulator);
                }, function(err) {
                    accumulator.push(err);
                    recurse(rows, i+1, accumulator);
                });
            }
            recurse(rows, 0, []);
        } else {
            res.status(404).send(`FeatureQueries not found (id: ${req.params.id})`)
        }
    }, function(err) {
        res.status(500).json(err);
    });
})

/*
    Get's the legend min and max values for viewing
    return {min: number, max: number}
*/
app.get('/legend/percent/:state?', cors(corsOptions), (req, res) => {
    // if there is no state provided calculate min max for the entire state
    let query = '';
    if (req.params.state) {
        query = `select * from Group5 join state on Group5.state = state.fips where state.name = "${req.params.state}"`;
    } else {
        query = `select * from Group5`;
    }
    db.query(query, function(rows) {
        let min = 100;
        let max = 0;
        rows.forEach(row => {
            let percentVal = parseFloat(row.DP05_0006PE);
            if (percentVal > max) {
                max = percentVal;
            }
            if (percentVal < min) {
                min = percentVal;
            }
        })
        res.json({ min, max });
    });
})

/*
    Get's individual value based on the state and county
    return {state_name: string, county_name: string, value: string}
*/
app.get('/state/:state_fips/county/:county_fips', cors(corsOptions), (req, res) => {
    const query = `select Group5.DP05_0006PE, state.state_name as state_name, Group5.county_name as county_name from Group5 
        join state on Group5.state = state.fips
        where Group5.state = "${req.params.state_fips}" and Group5.county = "${req.params.county_fips}"`;
    db.query(query, function(rows) {
        if (rows.length == 0) {
            res.send('No matching state and county', 404);
            return;
        }
        const row = rows[0];
        res.json({ state_name: row.state_name, county_name: row.county_name, value: row.DP05_0006PE });
    }, function(err) {
        res.send(`${err}`, 404);
    });
});

/*
    State routes
*/
app.get(stateEndpoints.search.route, cors(corsOptions), (req, res, next) => stateEndpoints.search.handler(req, res, next, db));
app.get(stateEndpoints.makeSvg.route, cors(corsOptions), (req, res, next) => stateEndpoints.makeSvg.handler(req, res, next, db));


/*
    Data routes
*/
app.post(dataEndpoints.use.route, (req, res, next) => dataEndpoints.use.handler(req, res, next, db));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
