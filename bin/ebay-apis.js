let ebayApi = process.env.API_KEY_EBAY,
    router = require(`express`).Router()
    log = module.parent.log,
    request = module.parent.request,


router.get(`/cheapest/ebay/:query`, function (req, res) {
    log(`REQUEST ON GET FROM EBAY/: ${req.params.query}`);
  
    let uri = 'https://svcs.ebay.com/services/search/FindingService/v1?SECURITY-APPNAME=%ebayApi%&OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&RESPONSE-DATA-FORMAT=JSON&callback=_cb_findItemsByKeywords&REST-PAYLOAD&keywords=%query%&paginationInput.entriesPerPage=6&GLOBAL-ID=EBAY-ENCA&siteid=2';
    let replacements = {"%ebayApi%": ebayApi,"%query%": req.params.query};
    
    uri = uri.replace(/%\w+%/g, function(all) {
        return replacements[all] || all;
    });

    request(uri, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(response.statusCode);
            res.json(body);
        }
    });

  
});

module.exports = router;
    
