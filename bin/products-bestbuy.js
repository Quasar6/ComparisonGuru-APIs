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
    
    fromBestbuy: function(req, callback) {

        let query = req.params.query.replace(/ /g, "&search=");
        
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
}
