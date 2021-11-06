const pgDb = require('../db-pg');
const uuid4 = require('uuid4');

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

exports.copyDefaultSession = async () => {
    const newToken = uuid4();

    const copySessionTokenQuery = `
        insert into session_tokens (token, data)
            select '${newToken}' as token, data
            from session_tokens
            where token = '${process.env.DEFAULT_SESSION}'
    `
    await pgDb.query(copySessionTokenQuery);

    const copySessionTokenMetaDataQuery = `
        insert into session_tokens_metadata (session_token, metadata)
            select '${newToken}' as token, metadata
            from session_tokens_metadata
            where session_token = '${process.env.DEFAULT_SESSION}';
    `;
    await pgDb.query(copySessionTokenMetaDataQuery)

    // Sql copy new and add in new token;
    return newToken;
}

exports.insertEmailRequest = async (token, email) => {
    const insertEmailRequestQuery = `
        insert into email_requests (
            session_token,
            email
        )
        values (
            '${token}',
            '${email}'
        )
    `
    await pgDb.query(insertEmailRequestQuery);
}