exports.use = {
    route: '/use',
    handler: function(req, res, next, db) {
        console.log(req.body);
        res.status(200).send('hello world');
    }
}