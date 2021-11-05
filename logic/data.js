const pgDb = require('../db-pg');

exports.setSessionTokenMetadata = async (token, metadata) => {
    const metaDataString = JSON.stringify(metadata);
    const value = { value: metaDataString, type: 'string' };
    const identifier = {
        column: 'session_token',
        value: {
            type: 'string', value: token
        }
    }
    await pgDb.update('session_tokens_metadata', 'metadata', value, identifier);
}

exports.getSessionTokenMetadata = async token => {
    const getQuery = `
        select * from session_tokens_metadata
            join session_tokens on session_token = token
            where token = '${token}';
    `;
    const result = await pgDb.query_first(getQuery);
    return JSON.parse(result.metadata);
}