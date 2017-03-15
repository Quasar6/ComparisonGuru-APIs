let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log;

let router = require(`express`).Router();

/**
 * Provides encryption and hashing capabilities
 * https://nodejs.org/api/crypto.html
 */
let crypto = require(`crypto`),
    // Constants for crypto.pbkdf2Sync() hashing
    CRYPTO_ITERATIONS = 10000,
    CRYPTO_KEY_LENGTH = 512,
    CRYPTO_DIGEST = `sha512`,
    CRYPTO_STRING_TYPE = `base64`;

let moment = require(`moment`);

router.post(`/users`, function (req, res) {

    log(`REQUEST ON POST /users: ${JSON.stringify(req.body)}`);

    if (req.body.lor == `r`) {
        req.body.password = new Buffer(crypto.pbkdf2Sync(
                req.body.password,
                req.body.email,
                CRYPTO_ITERATIONS,
                CRYPTO_KEY_LENGTH,
                CRYPTO_DIGEST
            ), `binary`).toString(CRYPTO_STRING_TYPE);
        users.save(req.body, function(err, saved) {
            let response = req.body;
            if (err) {
                log(`DB ERROR: `, err);
                res.status(500);
                response.error = `Database error. Try after some time.`;
            } else if (!saved) {
                res.status(300);
                response.error = `Registration failed. Try again.`;
            } else if (saved) {
                res.status(200);
            } else {
                res.status(400);
                response.error = `Server error. Try again.`;
            }
            delete response.lor;
            delete response._id;
            delete response.firstName;
            delete response.lastName;
            delete response.userName;
            delete response.password;
            delete response.homeAddress;
            delete response.postalCode;
            delete response.phone;

            log(`RESPONSE FROM POST /users: ${JSON.stringify(response)}`);

            res.send(response);
        });
    }
    else if (req.body.lor == `l`) {
        req.body.password = new Buffer(crypto.pbkdf2Sync(
                req.body.password,
                req.body.email,
                CRYPTO_ITERATIONS,
                CRYPTO_KEY_LENGTH,
                CRYPTO_DIGEST
            ), `binary`).toString(CRYPTO_STRING_TYPE);

        users.findByEmail(req.body.email, function(err, doc) {
            let response = req.body;
            if (err) {
                log(`DB ERROR: `, err);
                res.status(500);
                response = {"error": "Database error. Try after some time."};
            } else if (!doc || doc.password != req.body.password) {
                res.status(300);
                response = {"error": "Invalid login. Try again."};
            } else if (doc.password == req.body.password) {
                res.status(200);
                response._id = doc._id.toString();
            }
            delete response.lor;
            delete response.password;

            log(`RESPONSE FROM POST /users: ${JSON.stringify(response)}`);

            res.send(response);
        });
    }
});

module.exports = router;
