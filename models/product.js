class Product {

    constructor (id, name, category, price, store, currency, imageURL, url) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.store = store;
        this.currency = currency;
        this.imageURL = imageURL;
        this.url = url;
    }
    
    toJSONString() {
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

    print() {
        console.log(this.toJSONString());
    }
}
