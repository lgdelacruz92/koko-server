const uuid4 = require('uuid4');
const {
    getSessionData,
    insertSession
} = require('../modules/common-sql');

exports.use = {
    route: '/use',
    /**
     * inserts session into the data
     * 
     * Example: { min: 0, max: 100 }
     * @return { session: token }
     */
    handler: async (req, res, next) => {
        const session = uuid4();
        const data = JSON.stringify(req.body);
        try {
            await insertSession(session, data);
            res.status(200).json({ session: session })
        }
        catch(err) {
            next(err);
        }
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
     * @returns { min: number, max: number }
     */
    handler: async (req, res, next) => {
        try {
            const token = req.params.token;
            const dataRow = await getSessionData(token);
            const data = JSON.parse(dataRow.data);
            const maxData = getMaxSessionData(data.data);
            res.status(200).json({ min: 0, max: maxData });
        }
        catch (err) {
            next(err);
        }
    }
}