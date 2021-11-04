const pgDb = require('../db-pg');

exports.getStates = {
    route: '/states',

    /**
     * Get states
     * @param {*} res 
     * @param {*} pgDb 
     * @return [{ name, fips }]
     */
    handler: async (_, res, next) => {
        try {
            const result = await pgDb.query('select state_name as name, fips from states');
            res.status(200).json({ states: result.rows });
        }
        catch(err) {
            next(err);
        }
    },
}
