const uuid4 = require('uuid4');
const { getSessionData } = require('../modules/common-sql');
const { resourceNotFound } = require('../modules/utils');

exports.use = {
    route: '/use',
    handler: function(req, res, next, pgDb) {
        /**
         * assign a session token and give it back to user
         * 
         * success 200
         * err 500
         * */
        const sessionToken = uuid4();
        const data = JSON.stringify(req.body);
        const query = `insert into session_tokens (token, data) values ('${sessionToken}', '${data}')`;
        pgDb.query(query)
            .then(() => {
                res.status(200).json( { session: sessionToken });
            })
            .catch(() => {
                res.status(500).send('Something went wrong. Contact developers in the contact page.');
            });
    }
}

const getMaxSessionData = data => {
    return Math.max(...data.map(d => parseFloat(d.value)));
}

exports.legend = {
    route: '/legend/:token',

    /**
     * Gets the values for legend
     * 
     * Example: { min: 0, max: 100 }
     * @param {request} req 
     * @param {response} res 
     * @param {db} db 
     */
    handler: function(req, res, db) {
        const getLegend = async(req, res, db) => {
            try {
                const token = req.params.token;
                const dataRow = await getSessionData(db, token);
                const data = JSON.parse(dataRow.data);
                const maxData = getMaxSessionData(data.data);
                res.status(200).json({ min: 0, max: maxData });
            }
            catch(err) {
                res.status(404).send(resourceNotFound());
            }
        }
        getLegend(req, res, db);
    }
}