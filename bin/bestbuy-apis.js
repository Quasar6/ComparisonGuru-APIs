let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log,
    request = module.parent.request,
    apiKeyBB = process.env.API_KEY_BEST_BUY;

let router = require(`express`).Router();

router.get(`/`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    res.render(`home`);
});

router.get(`/cheapest/bestbuy/:query`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    let query = req.params.query.replace(/ /g, "&search=");
    request(`https://api.bestbuy.com/v1/products((search=${query})&condition=new&inStoreAvailability=true&(categoryPath.id=pcmcat209400050001))?apiKey=${apiKeyBB}&sort=name.asc&show=name,salePrice,manufacturer,modelNumber,includedItemList.includedItem,sku,upc,regularPrice,onSale&format=json`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(response.statusCode);
            res.json(body);
        }
    });
});

module.exports = router;