let router = require(`express`).Router(),
    amazonId = process.env.API_KEY_AMAZON_awsId,
    amazonSecret = process.env.API_KEY_Amazon_awsSecret,
    amazonAssocId = process.env.API_KEY_AMAZON_assocId 

const {OperationHelper} = require('apac');
 
router.get(`/cheapest/amazon/:query`, function (req, res) {
     log(`REQUEST ON GET FROM AMAZON/: ${req.params.query}`);

    const opHelper = new OperationHelper({
        awsId:     amazonId,
        awsSecret: amazonSecret,
        assocId:  amazonAssocId,
        locale:    'CA',
        merchantId: 'All'
    });
    //if (req.params.search)

    opHelper.execute('ItemSearch', {
    //'SearchIndex': '', //category
    'Keywords': req.params.query,
    'ResponseGroup': 'Request,Large', //'ItemAttributes,Offers'
    }).then((response) => {
        console.log("Results object: ", response.result);
        console.log("Raw response body: ", response.responseBody);

           res.status(200);
           

    }).catch((err) => {
        console.error("Something went wrong! ", err);
    });

});

module.exports = router;
    


