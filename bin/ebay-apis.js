let ebayApi = process.env.API_KEY_EBAY,
    router = require(`express`).Router()
    log = module.parent.log,
    request = module.parent.request,

router.get(`/cheapest/ebay/:query`, function (req, res) {

    log(`REQUEST ON GET FROM EBAY/: ${req.params.query}`);
  
    var url = `https://svcs.ebay.com/services/search/FindingService/v1`
            + `?SECURITY-APPNAME=${ebayApi}`
            + `&OPERATION-NAME=findItemsByKeywords`
            + `&SERVICE-VERSION=1.0.0`
            + `&RESPONSE-DATA-FORMAT=JSON`
            + `&callback=_cb_findItemsByKeywords`
            + `&REST-PAYLOAD`
            + `&keywords=${req.params.query}`
            + `&paginationInput.entriesPerPage=25`
            + `&GLOBAL-ID=EBAY-ENCA`
            + `&siteid=2`;
    
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = body.substring(body.indexOf('{')).slice(0, -1);
            res.status(response.statusCode);
            res.json(JSON.parse(body));
        }
    });
});

router.get(`/categories/bestbuy/`, function (req, res) {

    log(`REQUEST ON GET categories/bestbuy`);

    let categoryId = categories.get(req.params.category).bestbuy;
    let query = req.params.query.replace(/ /g, "&search=");

    var url = `http://open.api.ebay.com/Shopping?callname=GetCategoryInfo`
            + `&appid=${ebayApi}`
            + `&siteid=2` //Canada
            + `&CategoryID=-1`+
            `&version=729&IncludeSelector=ChildCategories`;
    
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.status(response.statusCode);
            res.json(JSON.parse(body));
        }
    });
});

module.exports = router;
