exports.makeSvg = {
    route: '/country/make/:country_name',
    handler: function(req, res) {
        const country = req.params.country_name;
        os_execute(`python3 ./modules/make-svg.py -s ${session} -f ${fips} 2> debug.log`, stdout => {
                res.status(200).send(stdout)
            },
            res
        );
    }
}
