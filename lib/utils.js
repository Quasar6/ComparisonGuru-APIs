let request = module.parent.request;

module.exports = {
    refreshRates: function() {
        request(`https://openexchangerates.org/api/latest.json?app_id=${process.env.API_KEY_OPENEXCHANGERATES}&base=USD`,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                module.parent.rates = JSON.parse(body).rates;
            }
        });
    },
    convertCurrency: function(price, from, to) {
        let convertedPrice = (price / module.parent.rates[from]) * module.parent.rates[to];
        return +(Math.round(convertedPrice + "e+2")  + "e-2");
    }
}
