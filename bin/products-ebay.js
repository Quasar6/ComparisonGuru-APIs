let request = module.parent.request,
    Product = module.parent.Product,
    convertCurrency = module.parent.utils.convertCurrency,
    constants = module.parent.constants,
    categories = constants.categories,
    currency = constants.currency,
    country = constants.country,
    currencyMap = constants.currencyMap,
    stores = constants.stores;

module.exports = {
    
    fromEbay: function(req, callback) {

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
                        products[i].itemId ? String(products[i].itemId[0]) : null,
                        products[i].title ? products[i].title[0] : null,
                        products[i].primaryCategory ? products[i].primaryCategory[0].categoryName[0] : null,
                        price ? +(Math.round(price + "e+2")  + "e-2") : null,
                        null,
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
}
