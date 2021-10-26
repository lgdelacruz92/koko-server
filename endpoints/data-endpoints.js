exports.use = {
    route: '/use',
    handler: function(req, res, next, db) {
        res.status(200).send('hello world');
    }
}