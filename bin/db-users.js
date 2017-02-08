//let log = module.parent.log;

// Get collection `users`
let users = module.parent.db.collection(`users`);

let ObjectId = module.parent.ObjectId;

// Add new user to DB
exports.save = function (user, callback) {
    users.save({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userName: user.userName,
        password: user.password,
        homeAddress: user.homeAddress,
        postalCode: user.postalCode,
        phone: user.phone
    }, function(err, saved) {
        callback(err, saved);
    });
}

// Find user by id
exports.findByID = function (uid, callback) {
    users.findOne(
        { _id: ObjectId(uid) },
        function(err, doc) {
            callback(err, doc);
        });
}

// Find user by email
exports.findByEmail = function (email, callback) {
    users.findOne(
        { email: email },
        function(err, doc) {
            callback(err, doc);
        });
}
