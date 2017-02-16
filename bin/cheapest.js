let users = module.parent.users,
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
    
    let url = `https://api.bestbuy.com/v1/products`
            + `((search=${query}))`
            + `?apiKey=${process.env.API_KEY_BEST_BUY}`
            + `&sort=customerReviewAverage.asc`
            + `&show=name,salePrice,modelNumber,sku,upc,regularPrice,onSale,mobileUrl,image,thumbnailImage`
            + `&format=json`
            + `&condition=new`
            + `&inStoreAvailability=true`
            + `&pageSize=25`;
    
    let cgCategory;
    if (cgCategory = categories.get(category)) {
        url = url.substr(0, url.indexOf(`(search=`))
            + `(categoryPath.id=${cgCategory.bestbuy})&`
            + url.substr(url.indexOf(`(search=`));
    }

    request(url, function (error, response, body) {
        let products;
        if (!error && response.statusCode == 200 && (products = JSON.parse(body).products)) {
            let cgBBProducts = [];
            for (let i = products.length - 1; i > -1; i--) {
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
        } else if(error) {
            callback(error, null);
        } else {
            callback({error: "Product not found."}, null);
        }
    });
}

function fromWalmart(query, category, callback) {

    let url = `http://api.walmartlabs.com/v1/search`
            + `?apiKey=${process.env.API_KEY_WALMART}`
            + `&query=${query}`
            + `&sort=customerRating`
            + `&order=asc`
            + `&numItems=25`
            + `&format=json`;

    let cgCategory;
    if (cgCategory = categories.get(category)) url += `&categoryId=${cgCategory.walmart}`;

    request(url, function (error, response, body) {
        let products;
        if (!error && response.statusCode == 200 && (products = JSON.parse(body).items)) {
            let cgWProducts = [];
            for (let i = products.length - 1; i > -1; i--) {
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
        } else if(error) {
            callback(error, null);
        } else {
            callback({error: "Product not found."}, null);
        }
    });
}

function fromEbay(query, category, callback) {

    let url = `https://svcs.ebay.com/services/search/FindingService/v1?`
            + `SECURITY-APPNAME=${process.env.API_KEY_EBAY}`
            + `&OPERATION-NAME=findItemsAdvanced` 
            + `&SERVICE-VERSION=1.0.0`
            + `&RESPONSE-DATA-FORMAT=JSON`
            + `&callback=_cb_findItemsByKeywords`
            + `&REST-PAYLOAD&paginationInput.entriesPerPage=25`
            + `&GLOBAL-ID=EBAY-ENCA&siteid=2`
            + `SortOrderType=BestMatch`
            + `&ConditionID=1000`
            + `&keywords=${query}`;

    let cgCategory;
    if (cgCategory = categories.get(category)) url += `&categoryId=${cgCategory.ebay}`;

    request(url, function (error, response, body) {
        let products;
        if (!error && response.statusCode == 200 
            && (products = JSON.parse(body.substring(body.indexOf('{')).slice(0, -1))
                            .findItemsAdvancedResponse[0].searchResult[0].item)) {
            let cgEProducts = [];
            for (let i = products.length - 1; i > -1; i--) {
                cgEProducts.push(new Product(
                    products[i].itemId?products[i].itemId[0]:null,
                    products[i].title?products[i].title[0]:null,
                    category,
                    products[i].sellingStatus?products[i].sellingStatus[0].currentPrice[0].__value__:null,
                    stores.ebay,
                    currency.CAD,
                    products[i].galleryURL?products[i].galleryURL[0]:null,
                    products[i].viewItemURL?products[i].viewItemURL[0]:null
                ));
            }
            callback(null, cgEProducts);
        } else if(error) {
            callback(error, null);
        } else {
            callback({error: "Product not found."}, null);
        }
    });
}

router.get(`/cheapest/:query`, function (req, res) {
    res.redirect(`/cheapest/${req.params.query}/undefined_category`);
});

router.get(`/cheapest/:query/:category`, function (req, res) {

    log(`REQUEST ON GET /cheapest/:query/:category: ${JSON.stringify(req.params)}`);

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
        },
        function(callback) {
            fromEbay(req.params.query, req.params.category, function (err, products) {
                callback(null, products);
            });
        }
    ],
    function(err, products) {
        var cgProducts = [];
        // Array.prototype.push.apply(cgProducts, products[0]);
        // Array.prototype.push.apply(cgProducts, products[1]);
        Array.prototype.push.apply(cgProducts, products[2]);
        cgProducts = cgProducts.sort(function(p1, p2) {
            return p1.price - p2.price;
        });
        res.json(cgProducts);
    });
});

module.exports = router;
