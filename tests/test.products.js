let parent = require(`../server.js`),
assert = require(`assert`),
utils = module.utils = require(`./lib/utils.js`),
fromBestbuy = module.fromBestbuy = require(`./bin/products-bestbuy.js`).fromBestbuy;
fromAmazon = module.fromAmazon = require(`./bin/products-amazon.js`).fromAmazon;
fromEbay = module.fromEbay = require(`./bin/products-ebay.js`).fromEbay;
fromWalmart = module.fromWalmart = require(`./bin/products-walmart.js`).fromWalmart;
   
describe(`Get Amazon Products`, function() {
  describe(`#findAll()`, function() {
    it(`should return products from amazon`, function() {
      fromAmazon.findAll(function(err, docs) {
        assert.equal(null, err);
      });
    });
  });
});

describe(`Get Ebay Products`, function() {
  describe(`#findAll()`, function() {
    it(`should return products from ebay`, function() {
      fromEbay.findAll(function(err, docs) {
        assert.equal(null, err);
      });
    });
  });
});

describe(`Get BestBuy Products`, function() {
  describe(`#findAll()`, function() {
    it(`should return products from ebay`, function() {
      fromBestbuy.findAll(function(err, docs) {
        assert.equal(null, err);
      });
    });
  });
});

describe(`Get Walmart Products`, function() {
  describe(`#findAll()`, function() {
    it(`should return products from ebay`, function() {
      fromWalmart.findAll(function(err, docs) {
        assert.equal(null, err);
      });
    });
  });
});