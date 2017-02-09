function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

var categories = new Map();

categories.set("phone", {bestbuy: "pcmcat209400050001", walmart: "3944_542371"});
categories.set("mobile", categories.get("phone"));

categories.set("laptop", {bestbuy: "abcat0502000", walmart: "3944_3951_132960"});
categories.set("desktop", {bestbuy: "abcat0501000", walmart: "3944_3951_132982"});

define("categories", categories);

const currency = {
    USD: "USD",
    CAD: "CAD"
};
define("currency", currency);

const stores = {
    bestbuy: "bestbuy",
    walmart: "walmart"
};
define("stores", stores);