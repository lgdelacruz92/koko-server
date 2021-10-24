const { removeStopWords } = require('./modules/utils');
const { exec } = require("child_process");
const fs = require('fs')

exports.search = {
    route: '/search',
    handler: function (req, res, next, db) {
        const cleanPossibleTags = removeStopWords(req.query.query);
        const tags = `"${cleanPossibleTags.join('","')}"`;
        const sqlQuery = [
            'select g.id, title, g.description  from GeographicFeatures as g',
            '\n\tjoin Tag_Feature',
            '\n\tjoin Tags',
            `\n\twhere name in (${tags})`,
            '\n\tgroup by feature_id;'
        ];
        db.query(sqlQuery.join(''), function(rows) {
            res.status(200).json({ response: rows })
        }, function(err) {
            res.status(404).json(err);
        });
    }
}

const os_execute = (command, stdoutCallback, res) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            res.status(500).send(`stderr: ${stderr}`);
            return;
        }
        stdoutCallback(stdout);
    });
}

exports.makeSvg = {
    route: '/make/:fips',
    handler: function(req, res, nex, db) {
        const fips = req.params.fips;
        const sqlQuery = `select * from GeoJSONs where state = "${fips}";`;

        db.query_first(sqlQuery, function(row) {
            os_execute(`python3 ./modules/make-svg.py -g '${row.geojson}' 2> debug.log`, stdout => {
                    res.status(200).send(stdout)
                }, 
                res
            );
        }, function(err) {
            res.status(404).json(err);
        });
    }
}