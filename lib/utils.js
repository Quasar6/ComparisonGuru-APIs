let request = module.parent.request,
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
    }
}
