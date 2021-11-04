const { resourceNotFound } = require('../modules/utils');

exports.getStates = {
    route: '/states',
    handler: (res, pgDb) => {
        /**
         * Gets the list of states and corresponding fips 
         * */        
        pgDb.query('select state_name as name, fips from states')
            .then(queryResult => {
                res.status(200).json({ states: queryResult.rows });
            })
            .catch(() => {
                res.status(404).send(resourceNotFound());
            });
    },
}
