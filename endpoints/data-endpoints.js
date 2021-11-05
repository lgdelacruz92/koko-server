const uuid4 = require('uuid4');
const {
    getSessionData,
    insertSession
} = require('../modules/common-sql');
const {
    setSessionTokenMetadata,
    getSessionTokenMetadata
} = require('../logic/data');

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

exports.session_token_metadata = {
    route: '/session_token_metadata',

    /** 
     * Adds extra info about the session
     * 
     * @return {void}
    */
    handler: async (req, res, next) => {
        try {
            const body = req.body;
            const token = body.token;
            const metadata = body.metadata;
            await setSessionTokenMetadata(token, metadata);
            res.status(200).send('success');
        }
        catch(err) {
            next(err);
        }
    }
}

exports.get_session_token_metadata = {
    route: '/session_token_metadata/:token',

    /** 
     * Gets the metadata for a particular session
     * 
     * @return { metadata }
    */
    handler: async (req, res, next) => {
       try {
            const token = req.params.token;
            const metadata = await getSessionTokenMetadata(token);
            res.status(200).json(metadata);
       }
       catch(err) {
           next(err);
       }
   }
}