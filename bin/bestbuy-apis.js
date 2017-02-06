let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log,
    request = module.parent.request,
    Fuse = module.parent.Fuse,
    apiKey = process.env.API_KEY_BEST_BUY;

let router = require(`express`).Router();

router.get(`/`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    res.render(`home`);
});

router.get(`/cheapest/bestbuy/:category/:query`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    request(`https://api.bestbuy.com/v1/categories(name=${req.params.category}*)?apiKey=bVCTSpIkR67BFLFKHCfkHpjK&pageSize=100&format=json`,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var options = {
                tokenize: true,
                findAllMatches: true,
                keys: ['name', 'subCategories.name']
            };

            log(`BODY: ${body}`);

            let fuse = new Fuse(JSON.parse(body).categories, options);
            let category = fuse.search(req.params.category)[0];

            log(`CATEGORY: ${JSON.stringify(category)}`);

            let query = req.params.query.replace(/ /g, "&search=");
            request(`https://api.bestbuy.com/v1/products((search=${query})&condition=new&inStoreAvailability=true&(categoryPath.id=${category.id}))?apiKey=${apiKey}&sort=name.asc&show=name,salePrice,manufacturer,modelNumber,includedItemList.includedItem,sku,upc,regularPrice,onSale&format=json`, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    res.status(response.statusCode);
                    res.json(body);
                }
            });
        }
    });
});

module.exports = router;