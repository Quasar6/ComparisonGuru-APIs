let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log,
    request = module.parent.request,
    async = require(`async`),
    Product = require(`../models/Product.js`),
    constants = require(`../lib/constants.js`),
    categories = constants.categories,
    currency = constants.currency,
    stores = constants.stores;

let router = require(`express`).Router();

function fromBestbuy(query, category, callback) {

    query = query.replace(/ /g, "&search=");
    let categoryId = categories.get(category).bestbuy;
    
    var url = `https://api.bestbuy.com/v1/products`
            + `((search=${query})`
            + `&(categoryPath.id=${categoryId}))`
            + `?apiKey=${process.env.API_KEY_BEST_BUY}`
            + `&sort=customerReviewAverage.asc`
            + `&show=name,salePrice,modelNumber,sku,upc,regularPrice,onSale,mobileUrl,image,thumbnailImage`
            + `&format=json`
            + `&condition=new`
            + `&inStoreAvailability=true`
            + `&pageSize=25`;
    
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var cgBBProducts = [];
            for (var products = JSON.parse(body).products, i = products.length - 1; i > -1; i--) {
                cgBBProducts.push(new Product(
                    products[i].sku,
                    products[i].name,
                    category,
                    products[i].salePrice,
                    stores.bestbuy,
                    currency.USD,
                    products[i].mobileUrl,
                    products[i].thumbnailImage
                ));
            }
            callback(null, cgBBProducts);
        }
    });
}

function fromWalmart(query, category, callback) {

    let categoryId = categories.get(category).walmart;

    var url = `http://api.walmartlabs.com/v1/search`
            + `?apiKey=${process.env.API_KEY_WALMART}`
            + `&query=${query}`
            + `&categoryId=${categoryId}`
            + `&sort=customerRating`
            + `&order=asc`
            + `&numItems=25`
            + `&format=json`;

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var cgWProducts = [];
            for (var products = JSON.parse(body).items, i = products.length - 1; i > -1; i--) {
                cgWProducts.push(new Product(
                    products[i].itemId,
                    products[i].name,
                    category,
                    products[i].salePrice,
                    stores.walmart,
                    currency.USD,
                    products[i].productUrl,
                    products[i].thumbnailImage
                ));
            }
            callback(null, cgWProducts);
        }
    });
}

router.get(`/cheapest/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    async.parallel([
        function(callback) {
            fromBestbuy(req.params.query, req.params.category, function (err, products) {
                callback(null, products);
            });
        },
        function(callback) {
            fromWalmart(req.params.query, req.params.category, function (err, products) {
                callback(null, products);
            });
        }
    ],
    function(err, products) {
        var cgProducts = [];
        Array.prototype.push.apply(cgProducts, products[0]);
        Array.prototype.push.apply(cgProducts, products[1]);
        cgProducts = cgProducts.sort(function(p1, p2) {
            return p1.price - p2.price;
        });
        res.json(cgProducts);
    });
});

module.exports = router;
