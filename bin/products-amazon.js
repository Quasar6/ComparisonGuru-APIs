let request = module.parent.request,
    Product = module.parent.Product,
    convertCurrency = module.parent.utils.convertCurrency,
    constants = module.parent.constants,
    categories = constants.categories,
    currency = constants.currency,
    country = constants.country,
    currencyMap = constants.currencyMap,
    stores = constants.stores;

const {OperationHelper} = require(`apac`);

module.exports = {
    
    fromAmazon: function(req, callback) {
        let amazonId = process.env.API_KEY_AMAZON_awsId,
        amazonSecret = process.env.API_KEY_Amazon_awsSecret,
        amazonAssocId = process.env.API_KEY_AMAZON_assocId;

        let cgCategory = categories.get(req.params.category);
        cgCategory = cgCategory ? cgCategory.amazon : "All";

        let currencyCode = currencyMap[req.geodata.country] || currency.CAD;

        const opHelper = new OperationHelper({
            awsId: amazonId,
            awsSecret: amazonSecret,
            assocId: amazonAssocId,
            locale: "CA",
            merchantId: cgCategory
        });

        opHelper.execute('ItemSearch', {
            'Keywords': req.params.query,
            'ResponseGroup': 'ItemAttributes,Large',
            'SearchIndex': cgCategory
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
                async: false
            }, function (err, resultjs) {
                if (!err && resultjs) {
                    let cgAProducts = [];
                    if (resultjs.items && resultjs.items.item) {
                        products = resultjs.items.item;
                        for (let i = products.length - 1; i > -1; i--) {
                            let price;
                            let salePrice;
                            let currencyCodeDefault = currency.CAD;
                            if (products[i].itemattributes.listprice) {
                                price = parseFloat(products[i].itemattributes.listprice.amount) / 100;
                                currencyCodeDefault = products[i].itemattributes.listprice.currencyCodeDefault;
                            }
                            else if (products[i].offersummary && products[i].offersummary.lowestnewprice) {
                                price = parseFloat(products[i].offersummary.lowestnewprice.amount) / 100;
                                currencyCodeDefault = products[i].offersummary.lowestnewprice.currencyCodeDefault;
                            }
                            else if (products[i].offers && products[i].offers.offer && 
                                    products[i].offers.offer.offerlisting) {
                                if (products[i].offers.offer.offerlisting.price) {
                                    price = parseFloat(products[i].offers.offer.offerlisting.price.amount) / 100;
                                    currencyCodeDefault = products[i].offers.offer.offerlisting.price.currencyCodeDefault;
                                }
                                if (products[i].offers.offer.offerlisting.saleprice) {
                                    salePrice = parseFloat(products[i].offers.offer.offerlisting.saleprice.amount) / 100;
                                }
                            }
                            if (currencyCodeDefault && (currencyCodeDefault !== currency.CAD)) {
                                price = convertCurrency(price, currencyCodeDefault, currencyCode);
                                salePrice = salePrice ? convertCurrency(salePrice, currencyCodeDefault, currencyCode) : null;
                            }
                            cgAProducts.push(new Product(
                                products[i].asin ? products[i].asin : null,
                                products[i].itemattributes ? products[i].itemattributes.title : null,
                                products[i].itemattributes ? products[i].itemattributes.binding : null,
                                price,
                                salePrice,
                                stores.amazon,
                                currencyMap[req.geodata.country] || currency.CAD,
                                products[i].detailpageurl,
                                products[i].smallimage ? products[i].smallimage.url : null,
                                currencyCodeDefault === currency.CAD ? country.CA : country.US
                            ));
                        }
                    }
                    callback(null, cgAProducts);
                } else callback(err, null);
            });
        }).catch((err) => {
            console.error("Something went wrong with Amazon API!", err);
            callback(err, null);
        });        
    }
}
