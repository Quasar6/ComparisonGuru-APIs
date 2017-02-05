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
        locale:    'US',
        merchantId: 'All' //,
    });

    opHelper.execute('ItemSearch', {
    //'SearchIndex': '', //category
    'Keywords': req.params.query,
    'ResponseGroup': 'ItemAttributes,Large', //'Request,ItemAttributes,Offers'
    'SearchIndex': 'All',
    //'ResponseGroup': 'ItemAttributes,Offers'

    }).then((response) => {
        console.log("Results object: ", response.result);
        console.log("Raw response body: ", response.responseBody);

        console.log('iterate reponse.result:')
        iterate(response.result, '')
        //response.result.ItemSearchResponse.Items

        console.log('2js:');
        var parseString = require('xml2js').parseString;
        var xml = response.result;
        parseString(xml, function (err, resultjs) {
            console.log(resultjs);
        });

        res.status(200);
        res.send(response.result);
    }).catch((err) => {
        console.error("Something went wrong! ", err);
        res.status(503);
        res.send();
    });
});

function iterate(obj, stack) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object") {
                    iterate(obj[property], stack + '.' + property);
                } else {
                    console.log(property + "   " + obj[property]);
                    //$('#output').append($("<div/>").text(stack + '.' + property))
                }
            }
        }
    }


module.exports = router;
    


