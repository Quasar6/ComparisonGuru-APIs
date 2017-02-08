let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log,
    request = module.parent.request,
    Fuse = module.parent.Fuse,
    apiKey = process.env.API_KEY_WALMART,
    categories = require(`../lib/constants.js`).categories;

let router = require(`express`).Router();

router.get(`/cheapest/walmart/:category/:query`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    let categoryId = categories.get(req.params.category).walmart;

    var url = `http://api.walmartlabs.com/v1/search`
            + `?apiKey=${apiKey}`
            + `&query=${req.params.query}`
            + `&categoryId=${categoryId}`
            + `&sort=customerRating`
            + `&order=asc`
            + `&numItems=25`
            + `&format=json`;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(response.statusCode);
            res.json(JSON.parse(body));
        }
    });
});

module.exports = router;
