let users = module.parent.users,
    log = module.parent.log,
    geoip = module.parent.geoip,
    async = module.parent.async,
    fromBestbuy = module.parent.fromBestbuy,
    fromWalmart = module.parent.fromWalmart,
    fromEbay = module.parent.fromEbay,
    fromAmazon = module.parent.fromAmazon,
    router = require(`express`).Router();

router.get(`/cheapest/walmart/:query`, function (req, res) {
    res.redirect(`/cheapest/walmart/${req.params.query}/undefined_category`);
});
router.get(`/cheapest/walmart/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /cheapest/walmart/:query/:category: ${JSON.stringify(req.params)}`);

    async.parallel([
        function(callback) {
            fromWalmart(req, function (err, products) {
                callback(null, products);
            });
        }
    ], asyncParallelCallback.bind({res: res}));
});

router.get(`/cheapest/bestbuy/:query`, function (req, res) {
    res.redirect(`/cheapest/bestbuy/${req.params.query}/undefined_category`);
});
router.get(`/cheapest/bestbuy/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /cheapest/bestbuy/:query/:category: ${JSON.stringify(req.params)}`);

    async.parallel([
        function(callback) {
            fromBestbuy(req, function (err, products) {
                callback(null, products);
            });
        }
    ], asyncParallelCallback.bind({res: res}));
});

router.get(`/cheapest/ebay/:query`, function (req, res) {
    res.redirect(`/cheapest/ebay/${req.params.query}/undefined_category`);
});
router.get(`/cheapest/ebay/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /cheapest/ebay/:query/:category: ${JSON.stringify(req.params)}`);

    async.parallel([
        function(callback) {
            fromEbay(req, function (err, products) {
                callback(null, products);
            });
        }
    ], asyncParallelCallback.bind({res: res}));
});

router.get(`/cheapest/amazon/:query`, function (req, res) {
    res.redirect(`/cheapest/amazon/${req.params.query}/undefined_category`);
});
router.get(`/cheapest/amazon/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /cheapest/amazon/:query/:category: ${JSON.stringify(req.params)}`);

    async.parallel([
        function(callback) {
            fromAmazon(req, function (err, products) {
                callback(null, products);
            });
        }
    ], asyncParallelCallback.bind({res: res}));
});

router.get(`/cheapest/:query`, function (req, res) {
    res.redirect(`/cheapest/${req.params.query}/undefined_category`);
});
router.get(`/cheapest/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /cheapest/:query/:category: ${JSON.stringify(req.params)}`);

    async.parallel([
        function(callback) {
            fromBestbuy(req, function (err, products) {
                callback(null, products);
            });
        },
        function(callback) {
            fromWalmart(req, function (err, products) {
                callback(null, products);
            });
        },
        function(callback) {
            fromEbay(req, function (err, products) {
                callback(null, products);
            });
        },
        function(callback) {
            fromAmazon(req, function (err, products) {
                callback(null, products);
            });
        }
    ], asyncParallelCallback.bind({res: res}));
});

let asyncParallelCallback = function(err, products) {
    var cgProducts = [];
    for (var i = products.length - 1; i > -1; i--) {
        Array.prototype.push.apply(cgProducts, products[i]);
    }
    cgProducts = cgProducts.sort(function(p1, p2) {
        return (p1.salePrice || p1.price) - (p2.salePrice || p2.price);
    });
    this.res.json(cgProducts);
}

module.exports = router;
