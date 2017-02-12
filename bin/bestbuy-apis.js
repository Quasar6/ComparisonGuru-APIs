let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log,
    request = module.parent.request,
    categories = require(`../lib/constants.js`).categories;

let router = require(`express`).Router();

router.get(`/cheapest/bestbuy/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    let categoryId = categories.get(req.params.category).bestbuy;
    let query = req.params.query.replace(/ /g, "&search=");

    var url = `https://api.bestbuy.com/v1/products` 
            + `((search=${query})`
            + `&(categoryPath.id=${categoryId}))`
            + `?apiKey=${process.env.API_KEY_BEST_BUY}`
            + `&sort=customerReviewAverage.asc`
            + `&show=name,salePrice,modelNumber,sku,upc,regularPrice,onSale`
            + `&format=json`
            + `&condition=new`
            + `&inStoreAvailability=true`
            + `&pageSize=25`;
    
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(response.statusCode);
            res.json(JSON.parse(body));
        }
    });
});


module.exports = router;
