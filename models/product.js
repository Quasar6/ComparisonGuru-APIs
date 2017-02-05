class Product {
    Id;// = {id: "id"};
    Name; // = {name: "name"};
    Description;
    Category;
    Price;
    Image;
    Url;
    Store;
    Currency;

    // constructor(id, name) {
    //     this.Id = id;
    //     this.Name = Name;
    // }
    
    toString() {
        return '(' + this.Id + ', ' + this.Name + ')';
    }
}

