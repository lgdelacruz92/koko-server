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
                const stateDataWithName = stateData.map(s => ({ ...s, county_name: 'Some name', state_name: 'Alabama'}));
                res.status(200).json({ data: stateDataWithName });
            })
            .catch(err => {
                res.status(404).send(err);
            })
    }
}