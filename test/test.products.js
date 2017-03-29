let parent = require(`../server.js`),
  assert = require(`assert`),
  utils = require(`../lib/utils.js`),
  fromBestbuy = require(`../bin/products-bestbuy.js`).fromBestbuy,
  fromAmazon = require(`../bin/products-amazon.js`).fromAmazon,
  fromEbay = require(`../bin/products-ebay.js`).fromEbay,
  fromWalmart = require(`../bin/products-walmart.js`).fromWalmart;

describe(`Get Amazon Products`, function () {
  describe(`#fromBestbuy()`, function () {
    it(`should return products from amazon`, function () {
      let req = {
        params: {query: "samsung smart tv", category: "undefined"},
        geodata: {country: "CA"}
      };
      fromAmazon(req, function (err, docs) {
        assert.equal(null, err);
      });
    });
  });
});

describe(`Get Ebay Products`, function () {
  describe(`#findAll()`, function () {
    it(`should return products from ebay`, function () {
      let req = {
        params: {query: "samsung smart tv", category: "undefined"},
        geodata: {country: "CA"}
      };
      fromEbay(req, function (err, docs) {
        assert.equal(null, err);
      });
    });
  });
});

describe(`Get BestBuy Products`, function () {
  describe(`#findAll()`, function () {
    it(`should return products from ebay`, function () {
      let req = {
        params: {query: "samsung smart tv", category: "undefined"},
        geodata: {country: "CA"}
      };
      fromBestbuy(req, function (err, docs) {
        assert.equal(null, err);
      });
    });
  });
});

describe(`Get Walmart Products`, function () {
  describe(`#findAll()`, function () {
    it(`should return products from ebay`, function () {
      let req = {
        params: {query: "samsung smart tv", category: "undefined"},
        geodata: {country: "CA"}
      };
      fromWalmart(req, function (err, docs) {
        assert.equal(null, err);
      });
    });
  });
});