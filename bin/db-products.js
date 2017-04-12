let log = module.parent.log,
    // Get collection `products`
    products = module.parent.db.collection(`products`),
    ObjectId = module.parent.ObjectId,
    moment = require(`moment`);

// Add new product to DB
exports.save = function (product, callback) {
    products.findOneAndUpdate(
        { id: product.id },
        {
            $inc: { hits: 1 },
            $push: { trend: {
                price: product.salePrice || product.price,
                date: moment().format()
            }},
            $setOnInsert: product
        },
        { upsert: true },
        function (err, doc) {
            callback(err, doc);
        }
    );
}

exports.saveReview = function (product, callback) {
    products.findOneAndUpdate(
        { id: product.productId },
        {
            $push: { reviews: {
                comment: product.comment,
                rating: product.rating,
                date: moment().format(),
                userName: product.userName,
                userImage: product.userImage
            }}
        },
        function (err, doc) {
            callback(err, doc);
        }
    );
}

// Find product by id
exports.findByID = function (uid, callback) {
    products.findOne(
        { _id: ObjectId(uid) },
        function(err, doc) {
            callback(err, doc);
        }
    );
}

// Find all products
exports.findAll = function (callback) {
    products.find({}).sort({hits: -1}).limit(10).toArray(function (err, docs) {
        callback(err, docs);
    });
}
