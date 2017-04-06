let request = module.parent.request,
    log = module.parent.log,
    fs = module.parent.fs;

module.exports = {
    log: function (message) { // Shorthand logging function
        console.log(`\n${message}`);
    },
    refreshRates: function() {
        request(`https://openexchangerates.org/api/latest.json?app_id=${process.env.API_KEY_OPENEXCHANGERATES}&base=USD`,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                module.parent.rates = JSON.parse(body).rates;
                fs.writeFile(`./lib/exchange-rates.json`, JSON.stringify(module.parent.rates), function(err) {
                    if (err) {
                        console.log(`Exchange rates update failed: ${err}`);
                    } else {
                        console.log(`Exchange rates updated.`);
                    }
                });
            } else {
                console.log(`OpenExchangeRates api error: ${JSON.stringify(response)}`);
            }
        });
    },
    convertCurrency: function(price, from, to) {
        let convertedPrice = (price / module.parent.rates[from]) * module.parent.rates[to];
        return +(Math.round(convertedPrice + "e+2")  + "e-2");
    },
    improveResults: function(products) {
        if (!products) return null;
        let minPrice = products[0].salePrice || products[0].price;
        let maxPrice = products[products.length - 1].salePrice || products[products.length - 1].price;
        let possibleIndexes = [];
        for (let i = 0; i < products.length - 1; i++) {
            let jump = (products[i+1].salePrice || products[i+1].price) - 
                        (products[i].salePrice || products[i].price);
            let percent;
            if ((percent = (jump * 100 / (products[i].salePrice || products[i].price))) > 200) {
                possibleIndexes.push({index: i + 1, percent: percent});
            }
        }
        if (possibleIndexes.length > 0) {
            let max = possibleIndexes.reduce(function(prev, current) {
                return (prev.percent > current.percent) ? prev : current;
            });
            products = products.slice(max.index, products.length - 1);
        }
        return products;
    }
}
