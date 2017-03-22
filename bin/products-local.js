let products = module.parent.products,
    log = module.parent.log,
    router = require(`express`).Router();

router.post(`/products`, function (req, res) {

    log(`REQUEST ON POST /products: ${JSON.stringify(req.body)}`);

    products.save(req.body, function(err, saved) {
        let response = {};
        response.success = false;
        if (err) {
            log(`DB ERROR: ${err}`);
            res.status(500);
            response.error = `Database error. Try after some time.`;
        } else if (!saved) {
            res.status(300);
            response.error = `Could not save product. Try again.`;
        } else if (saved) {
            res.status(200);
            response.success = true;
        } else {
            res.status(400);
            response.error = `Server error. Try again.`;
        }
        res.send(response);
    });
});

router.get(`/products`, function (req, res) {

    log(`REQUEST ON GET /products`);

    products.findAll(function(err, docs) {
        let response = docs;
        res.status(200);
        if (err) {
            log(`DB ERROR: ${err}`);
            res.status(500);
            response = {"error": "Database error. Try after some time."};
        } else if (!docs) {
            res.status(200);
            response = {"error": "No products found. Try again."};
        }
        res.send(response);
    });
});

module.exports = router;
