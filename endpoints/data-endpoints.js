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