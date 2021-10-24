var sqlite3 = require('sqlite3').verbose()

const sql_query = (query, callback, errCallback) => {
    var db = new sqlite3.Database('koko.db')
    db.serialize(function () {
        db.all(query, function (err, row) {
            if (err) {
                errCallback(err);
                return
            }
            callback(row);
        })
    })
    db.close()
}

exports.query = sql_query;

exports.query_first = (query, callback, errCallback) => {
    sql_query(query, function(rows) {
        if (rows.length === 0) {
            errCallback();
            return;
        }
        callback(rows[0]);
    }, errCallback)
}
