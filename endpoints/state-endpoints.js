const { removeStopWords, os_execute, resourceNotFound } = require('../modules/utils');

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

exports.makeSvg = {
    route: '/make/:fips',
    handler: function(req, res) {
        const fips = req.params.fips;
        const session = req.body.session;
        os_execute(`python3 ./modules/make-svg.py -s ${session} -f ${fips} 2> debug.log`, stdout => {
                res.status(200).send(stdout)
            },
            res
        );
    }
}

exports.getStates = {
    route: '/states',
    handler: async function(res, db) {
        db.sql_execute('select state_name as name, fips from state')
            .then(state_rows => {
                res.status(200).json({ states: state_rows }) 
            })
            .catch(err => {
                res.status(404).send(resourceNotFound('States'));
            })
        
    }
}