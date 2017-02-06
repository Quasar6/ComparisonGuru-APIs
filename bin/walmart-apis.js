let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log,
    request = module.parent.request,
    Fuse = module.parent.Fuse,
    apiKey = process.env.API_KEY_WALMART;

let router = require(`express`).Router();

router.get(`/cheapest/walmart/:category/:query`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    var categoryId;

    request(`http://api.walmartlabs.com/v1/taxonomy?apiKey=${apiKey}`,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let options = {
                tokenize: true,
                findAllMatches: true,
                keys: ['name']
            };
            let category = new Fuse(JSON.parse(body).categories, options).search(`${req.params.category}`);
            log(`CATEGORY: ${JSON.stringify(category[0])}`);
            request(`http://api.walmartlabs.com/v1/search?apiKey=${apiKey}&query=${req.params.query}&sort=price&order=asc&format=json&categoryId=${category[0].id}`,
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    res.status(response.statusCode);
                    res.json(JSON.parse(body));
                }
            });
        }
    });
});

module.exports = router;
