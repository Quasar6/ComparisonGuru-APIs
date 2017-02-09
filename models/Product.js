function Product (id, name, category, price, store, currency, imageURL, url) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.store = store;
    this.currency = currency;
    this.imageURL = imageURL;
    this.url = url;
}

Product.prototype.toJSONString = function() {
    return JSON.stringify({
        id: this.id,
        name: this.name,
        category: this.category,
        price: this.price,
        store: this.store,
        currency: this.currency,
        imageURL: this.imageURL,
        url: this.url
    });
}

Product.prototype.print = function() {
    console.log(this.toJSONString());
}

module.exports = Product;