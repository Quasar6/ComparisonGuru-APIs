let request = module.parent.request,
    log = module.parent.log;

module.exports.refreshRates = function() {
    request(`https://openexchangerates.org/api/latest.json?app_id=${process.env.API_KEY_OPENEXCHANGERATES}&base=USD`,
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            module.parent.rates = JSON.parse(body).rates;
        }
    });
}

return module.exports;