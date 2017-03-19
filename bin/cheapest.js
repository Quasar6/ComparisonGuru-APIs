let users = module.parent.users,
    log = module.parent.log,
    request = module.parent.request,
    geoip = module.parent.geoip,
    async = module.parent.async,
    Product = module.parent.Product,
    constants = module.parent.constants,
    categories = constants.categories,
    currency = constants.currency,
    country = constants.country,
    currencyMap = constants.currencyMap,
    stores = constants.stores;

let router = require(`express`).Router();
const {OperationHelper} = require(`apac`);

function convertCurrency (price, from, to) {
    let convertedPrice = (price / module.parent.rates[from]) * module.parent.rates[to];
    return +(Math.round(convertedPrice + "e+2")  + "e-2");
}

function fromBestbuy(req, callback) {

    query = req.params.query.replace(/ /g, "&search=");
    
    let url = `https://api.bestbuy.com/v1/products`
            + `((search=${query})&onlineAvailability=true)`
            + `?apiKey=${process.env.API_KEY_BEST_BUY}`
            + `&sort=bestSellingRank.asc`
            + `&show=sku,bestSellingRank,color,condition,image,longDescription,manufacturer,mobileUrl,name,onlineAvailability,regularPrice,salePrice,shippingCost,thumbnailImage`
            + `&format=json`
            + `&condition=new`
            + `&pageSize=10`;
    
    let cgCategory;
    if (cgCategory = categories.get(req.params.category)) {
        url = url.substr(0, url.indexOf(`(search=`))
            + `(categoryPath.id=${cgCategory.bestbuy})&`
            + url.substr(url.indexOf(`(search=`));
    }

    request(url, function (error, response, body) {
        let products;
        let currencyCode = currencyMap[req.geodata.country] || currency.CAD;
        if (!error && response.statusCode == 200 && (products = JSON.parse(body).products)) {
            let cgBBProducts = [];
            for (let i = products.length - 1; i > -1; i--) {
                cgBBProducts.push(new Product(
                    products[i].sku,
                    products[i].name,
                    req.params.category,
                    products[i].regularPrice ? 
                        convertCurrency(products[i].regularPrice, currency.USD, currencyCode) : null,
                    products[i].salePrice ? 
                        convertCurrency(products[i].salePrice, currency.USD, currencyCode) : null,
                    stores.bestbuy,
                    currencyCode,
                    products[i].mobileUrl,
                    products[i].thumbnailImage,
                    country.US
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

function fromAmazon(req, callback) {
    let amazonId = process.env.API_KEY_AMAZON_awsId,
        amazonSecret = process.env.API_KEY_Amazon_awsSecret,
        amazonAssocId = process.env.API_KEY_AMAZON_assocId;

    let cgCategory = categories.get(req.params.category);
    cgCategory = cgCategory ? cgCategory.amazon : "All";

    let currencyCode = currencyMap[req.geodata.country] || currency.CAD;

    const opHelper = new OperationHelper({
        awsId: amazonId,
        awsSecret: amazonSecret,
        assocId: amazonAssocId,
        locale: "CA",
        merchantId: cgCategory
    });

    opHelper.execute('ItemSearch', {
        'Keywords': req.params.query,
        'ResponseGroup': 'ItemAttributes,Large',
        'SearchIndex': cgCategory
    }).then((response) => {
        require('xml2js').parseString(response.responseBody, {
            trim: true,
            normalize: true,
            firstCharLowerCase: true,
            stripPrefix: true,
            parseNumbers: true,
            parseBooleans: true,
            normalizeTags: true,
            explicitRoot: false,
            ignoreAttrs: true,
            mergeAttrs: true,
            explicitArray: false,
            async: false
        }, function (err, resultjs) {
            if (!err && resultjs) {
                let cgAProducts = [];
                if (resultjs.items && resultjs.items.item) {
                    products = resultjs.items.item;
                    for (let i = products.length - 1; i > -1; i--) {
                        let price;
                        let salePrice;
                        let currencyCodeDefault = currency.CAD;
                        if (products[i].itemattributes.listprice) {
                            price = parseFloat(products[i].itemattributes.listprice.amount) / 100;
                            currencyCodeDefault = products[i].itemattributes.listprice.currencyCodeDefault;
                        }
                        else if (products[i].offersummary && products[i].offersummary.lowestnewprice) {
                            price = parseFloat(products[i].offersummary.lowestnewprice.amount) / 100;
                            currencyCodeDefault = products[i].offersummary.lowestnewprice.currencyCodeDefault;
                        }
                        else if (products[i].offers && products[i].offers.offer && 
                                products[i].offers.offer.offerlisting) {
                            if (products[i].offers.offer.offerlisting.price) {
                                price = parseFloat(products[i].offers.offer.offerlisting.price.amount) / 100;
                                currencyCodeDefault = products[i].offers.offer.offerlisting.price.currencyCodeDefault;
                            }
                            if (products[i].offers.offer.offerlisting.saleprice) {
                                salePrice = parseFloat(products[i].offers.offer.offerlisting.saleprice.amount) / 100;
                            }
                        }
                        if (currencyCodeDefault && (currencyCodeDefault !== currency.CAD)) {
                            price = convertCurrency(price, currencyCodeDefault, currencyCode);
                            salePrice = salePrice ? convertCurrency(salePrice, currencyCodeDefault, currencyCode) : null;
                        }
                        cgAProducts.push(new Product(
                            products[i].asin ? products[i].asin : null,
                            products[i].itemattributes ? products[i].itemattributes.title : null,
                            products[i].itemattributes ? products[i].itemattributes.binding : null,
                            price,
                            salePrice,
                            stores.amazon,
                            currencyMap[req.geodata.country] || currency.CAD,
                            products[i].detailpageurl,
                            products[i].smallimageurl,
                            currencyCodeDefault === currency.CAD ? country.CA : country.US
                        ));
                    }
                }
                callback(null, cgAProducts);
            } else callback(err, null);
        });
    }).catch((err) => {
        console.error("Something went wrong with Amazon API!", err);
        callback(err, null);
    });
}

function fromWalmart(req, callback) {

    let url = `http://api.walmartlabs.com/v1/search`
            + `?apiKey=${process.env.API_KEY_WALMART}`
            + `&query=${req.params.query}`
            + `&sort=relevance`
            + `&order=asc`
            + `&numItems=10`
            + `&format=json`;

    let cgCategory;
    if (cgCategory = categories.get(req.params.category)) url += `&categoryId=${cgCategory.walmart}`;

    request(url, function (error, response, body) {
        let products;
        let currencyCode = currencyMap[req.geodata.country] || currency.CAD;
        if (!error && response.statusCode == 200 && (products = JSON.parse(body).items)) {
            let cgWProducts = [];
            for (let i = products.length - 1; i > -1; i--) {
                let price = products[i].msrp || null;
                let salePrice = products[i].salePrice || null;
                cgWProducts.push(new Product(
                    products[i].itemId,
                    products[i].name,
                    products[i].categoryPath,
                    products[i].msrp ? 
                        convertCurrency(products[i].msrp, currency.USD, currencyCode) : null,
                    products[i].salePrice ? 
                        convertCurrency(products[i].salePrice, currency.USD, currencyCode) : null,
                    stores.walmart,
                    currencyMap[req.geodata.country] || currency.CAD,
                    products[i].productUrl,
                    products[i].thumbnailImage,
                    country.US
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

function fromEbay(req, callback) {

    let url = `https://svcs.ebay.com/services/search/FindingService/v1?`
            + `SECURITY-APPNAME=${process.env.API_KEY_EBAY}`
            + `&OPERATION-NAME=findItemsByKeywords`
            + `&SERVICE-VERSION=1.0.0`
            + `&RESPONSE-DATA-FORMAT=JSON`
            + `&GLOBAL-ID=EBAY-ENCA`
            + `&REST-PAYLOAD`
            + `&paginationInput.entriesPerPage=10`
            + `&siteid=2`
            + `&sortOrder=BestMatch`
            + `&itemFilter(0).name=Condition`
            + `&itemFilter(0).value(0)=New`
            + `&itemFilter(0).value(1)=1000`
            + `&itemFilter(1).name=HideDuplicateItems`
            + `&itemFilter(1).value=true`
            + `&keywords=${req.params.query}`;

    let cgCategory;
    if (cgCategory = categories.get(req.params.category)) url += `&categoryId=${cgCategory.ebay}`;

    request(url, function (error, response, body) {
        let products;
        let currencyCode = currencyMap[req.geodata.country] || currency.CAD;
        if (!error && response.statusCode == 200 
            && (products = JSON.parse(body)
                            .findItemsByKeywordsResponse[0].searchResult[0].item)) {
            let cgEProducts = [];
            for (let i = products.length - 1; i > -1; i--) {
                let price;
                let currencyCodeDefault = currency.CAD;
                if (products[i].sellingStatus && 
                    products[i].sellingStatus[0].currentPrice) {
                        price = Number(products[i].sellingStatus[0].currentPrice[0].__value__) || null;
                        currencyCodeDefault = products[i].sellingStatus[0].currentPrice[0]['@currencyId'] || null;
                }
                if (currencyCodeDefault && (currencyCodeDefault !== currency.CAD)) {
                    price = price ? convertCurrency(price, currencyCodeDefault, currencyCode) : null;
                }
                cgEProducts.push(new Product(
                    products[i].itemId ? Number(products[i].itemId[0]) : null,
                    products[i].title ? products[i].title[0] : null,
                    products[i].primaryCategory ? products[i].primaryCategory[0].categoryName[0] : null,
                    price,
                    null,
                    stores.ebay,
                    currencyMap[req.geodata.country] || currency.CAD,
                    products[i].viewItemURL ? products[i].viewItemURL[0] : null,
                    products[i].galleryURL ? products[i].galleryURL[0] : null,
                    currencyCodeDefault === currency.CAD ? country.CA : country.US
                ));
            }
            callback(null, cgEProducts);
        } else if (error) {
            callback(error, null);
        } else {
            callback({error: "Product not found."}, null);
        }
    });
}

router.use(function (req, res, next) {
    req.geodata = {};
    req.geodata.country = geoip.lookup(req.ip).country;
    next();
});

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
