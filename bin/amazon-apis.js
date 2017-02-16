let router = require(`express`).Router(),
    amazonId = process.env.API_KEY_AMAZON_awsId,
    amazonSecret = process.env.API_KEY_Amazon_awsSecret,
    amazonAssocId = process.env.API_KEY_AMAZON_assocId,
    log = module.parent.log;

const {OperationHelper} = require(`apac`);

router.get(`/cheapest/amazon/:query`, function (req, res) {

    log(`REQUEST ON GET FROM AMAZON/: ${req.params.query}`);

    const opHelper = new OperationHelper({
        awsId: amazonId,
        awsSecret: amazonSecret,
        assocId: amazonAssocId,
        locale: "CA",
        merchantId: "All"
    });

    opHelper.execute('ItemSearch', {
        //'SearchIndex': '', //category
        'Keywords': req.params.query,
        'ResponseGroup': 'ItemAttributes,Large', //'Request,ItemAttributes,Offers'
        'SearchIndex': 'All'
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
            async: true
        }, function (err, resultjs) {
            if (!err && resultjs) res.json(resultjs.items);
        });
    }).catch((err) => {
        console.error("Something went wrong!", err);
        res.status(503);
        res.send();
    });
});

module.exports = router;
