function Product (id, name, category, price, salePrice, longDesc, store, currency, url, imageURL, shippingCountry) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.salePrice = salePrice;
    this.description = longDesc;
    this.store = store;
    this.currency = currency;
    this.url = url;
    if (imageURL) this.imageURL = imageURL.replace('http:', 'https:');
    this.shippingCountry = shippingCountry;
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
        imageURL: this.imageURL,
        shippingCountry: this.shippingCountry
    });
}

Product.prototype.print = function() {
    console.log(this.toJSONString());
}

module.exports = Product;
