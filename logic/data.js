const pgDb = require('../db-pg');

exports.setSessionTokenMetadata = async (token, metadata) => {
    const metaDataString = JSON.stringify(metadata);
    const columns = ['session_token', 'metadata'];
    const values = [{ value: token, type: 'string'}, { value: metaDataString, type: 'string' }]
    await pgDb.insert('session_tokens_metadata', columns, values);
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