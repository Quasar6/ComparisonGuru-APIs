let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log,
    request = module.parent.request,
    apiKeyEB = process.env.API_KEY_EBAY;

let router = require(`express`).Router();

router.get(`/cheapest/ebay/:query`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    request(`URL goes here`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(response.statusCode);
            res.json(body);
        }
    });
});

module.exports = router;