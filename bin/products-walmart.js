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
    
    fromWalmart: function(req, callback) {

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
}