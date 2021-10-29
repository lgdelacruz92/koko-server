const uuid4 = require('uuid4');

exports.use = {
    route: '/use',
    handler: function(req, res, next, db) {
        // assign a session token and give it back to user
        const sessionToken = uuid4();
        db.sql_execute(`insert into SessionTokens(token, data) values("${sessionToken}",'${JSON.stringify(req.body)}');`)
            .then(() => res.status(200).json({ session: sessionToken }))
            .catch(() => res.status(500).send('Something went wrong. Contact developers in the contact page.'))
    }
}

exports.getData = {
    route: '/data/:state_fips',
    handler: function(req, res, db) {
        const stateFips = req.params.state_fips;
        const sessionKey = req.body.session;
        db.sql_execute_first(`select data from SessionTokens where token = '${sessionKey}'`)
            .then(row => {
                const dataJson = JSON.parse(row.data);
                const stateData = dataJson.data.filter(d => d.state_fips === stateFips);

                const query = `select fips, state_name, county_name from County where state = '${stateFips}'`
                console.log(query);
                db.sql_execute(query)
                    .then(countyRows => {
                        const reducer = (prev, cur) => {
                            prev[cur.fips] = {...cur};
                            return prev;
                        }
                        const map = countyRows.reduce(reducer, {});

                        const stateDataWithName = stateData.map(s => ({ ...s, county_name: map[s.state_fips + s.county_fips].county_name, state_name: map[s.state_fips + s.county_fips].state_name}));
                        res.status(200).json({ data: stateDataWithName });
                    })
            })
            .catch(err => {
                res.status(404).send(err);
            })
    }
}