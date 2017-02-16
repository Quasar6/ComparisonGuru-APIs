function Product (id, name, category, price, salePrice, store, currency, url, imageURL) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.salePrice = salePrice;
    this.store = store;
    this.currency = currency;
    this.url = url;
    this.imageURL = imageURL;
}

Product.prototype.toJSONString = function() {
    return JSON.stringify({
        id: this.id,
        name: this.name,
        category: this.category,
        price: this.price,
        salePrice: this.salePrice,
        store: this.store,
        currency: this.currency,
        url: this.url,
        imageURL: this.imageURL
    });
}

Product.prototype.print = function() {
    console.log(this.toJSONString());
}

module.exports = Product;