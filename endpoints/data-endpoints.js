const uuid4 = require('uuid4');

exports.use = {
    route: '/use',
    handler: function(req, res, next, db) {
        // assign a session token and give it back to user
        const sessionToken = uuid4();
        db.sql_execute(`insert into SessionTokens(token, data) values("${sessionToken}","adfad");`)
            .then(res => console.log(res))
            .catch(err => console.log(err))
        // Match all state fips and county fips to existing db state and county fips
        // If a state-county fips has no match add zero for value and zero for percent
        // Make svg for all existing geojsons
        // Save them in a session db
        // if session token is not received in the last 30 mins
        // delete it
        res.status(200).send('hello world');
    }
}