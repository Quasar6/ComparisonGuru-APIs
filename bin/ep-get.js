let users = module.parent.users,
    vendors = module.parent.vendors,
    orders = module.parent.orders,
    log = module.parent.log;

let router = require(`express`).Router();

router.get(`/`, function (req, res) {

    log(`REQUEST ON GET /: ${JSON.stringify(req.params)}`);

    res.render(`home`);
});

module.exports = router;