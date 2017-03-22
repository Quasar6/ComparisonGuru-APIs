let // PORT and IP where server listens
    PORT = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || process.env.npm_package_config_port || 8080,
    IP = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || process.env.npm_package_config_ip || `0.0.0.0`,
    express = require(`express`), // Express server
    server = express(),
    environment = server.get(`env`), // Environment (production or development) where server has been deployed
    CronJob = require(`cron`).CronJob;

    module.request = require(`request`);

let utils = module.utils = require(`./lib/utils.js`),
    log = module.log = utils.log,
    geoip = module.geoip = require(`geoip-lite`);

    module.async = require(`async`);
    module.rates = {};
    module.Product = require(`./models/Product.js`);
    module.constants = require(`./lib/constants.js`);
    module.fromBestbuy = require(`./bin/products-bestbuy.js`).fromBestbuy;
    module.fromAmazon = require(`./bin/products-amazon.js`).fromAmazon;
    module.fromEbay = require(`./bin/products-ebay.js`).fromEbay;
    module.fromWalmart = require(`./bin/products-walmart.js`).fromWalmart;

    require(`dotenv`).config();

/**
 * Compress all responses
 * https://www.npmjs.com/package/compression
 */
let compression = require(`compression`);
server.use(compression());

/**
 * Add security headers
 * https://www.npmjs.com/package/helmet
 */
let helmet = require(`helmet`);
server.use(helmet());

/**
 * Parse encoded bodies
 * https://www.npmjs.com/package/body-parser
 */
let bodyParser = require(`body-parser`);
server.use(bodyParser.json());       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// Use pug for static content
server.set(`view engine`, `pug`);
server.set(`views`, `./static/home`);
server.use(`/`, express.static(__dirname + `/static/home`));

// Redirect /static request to /
server.use(`/static`, function (req, res) {
    res.redirect(`/`);
});

/**
 * Mongodb for database management
 * https://www.npmjs.com/package/mongodb
 */
let MongoClient = require(`mongodb`).MongoClient;

let mongoURL;
//mongoURL = `mongodb://127.0.0.1:27017/cguru`; // Local Node.js, local DB
//mongoURL = `mongodb://admin:HW-Pzez5sxZK@127.0.0.1:27017/cguru`; // Local Node.js, Openshift DB
// Openshift V2 DB URL
if (process.env.OPENSHIFT_MONGODB_DB_USERNAME) {
    mongoURL = `mongodb://` +
            `${process.env.OPENSHIFT_MONGODB_DB_USERNAME}:` +
            `${process.env.OPENSHIFT_MONGODB_DB_PASSWORD}@` +
            `${process.env.OPENSHIFT_MONGODB_DB_HOST}:` +
            `${process.env.OPENSHIFT_MONGODB_DB_PORT}/` +
            process.env.OPENSHIFT_APP_NAME;
}
// Mongolab URL
if (process.env.MONGOLAB_URI) {
    mongoURL = process.env.MONGOLAB_URI;
}

// Create connection to DB at mongoURL
MongoClient.connect(mongoURL, function(err, db) {
    if (!err) {
        /**
         * Generate random UUIDs for login sessions
         * https://www.npmjs.com/package/uuid
         */
        const uuid = require(`uuid`);

        /**
         * Use sessions for Express
         * https://www.npmjs.com/package/express-session
         */
        const session = require(`express-session`);

        // Use mongodb to store sessions
        const MongoStore = require(`connect-mongo`)(session);

        let sess = {
            name: "comparisonguru_session",
            genid: function(req) {
                return uuid.v1(); // use unique id for sessions
            },
            secret: "Signed by ryan652 @ Quasar",
            resave: true,
            saveUninitialized: true,
            rolling: true,
            store: new MongoStore({
                db: db,
                autoRemove: "interval",
                autoRemoveInterval: 30 // 30 mins
            }),
            unset: "destroy",
            cookie: {
                secure: false,
                httpOnly: false,
                //expires: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
                maxAge: 30 * 60 * 1000 // 30 mins
            }
        }
        if (process.env.IS_SECURE === `1`) {
            sess.cookie.secure = true; // serve secure cookies
            sess.cookie.httpOnly = true;
        }
        server.use(session(sess));

        module.db = db;
        module.ObjectId = require(`mongodb`).ObjectId;

        module.users = require(`./bin/db-users.js`);
        module.products = require(`./bin/db-products.js`);

        server.use(require(`./bin/user-apis.js`));
        server.use(require(`./bin/products-local.js`));
        
        log(`Connected successfully to database.`);
    } else log(`Database error: ${err}`);
});

environment === `production` && server.set(`trust proxy`, 1); // trust first proxy
server.use(function (req, res, next) {
    req.geodata = {};
    environment === `production` && (req.geodata.country = geoip.lookup(req.ip).country);
    next();
});

server.use(require(`./bin/cheapest.js`));

server.listen(PORT, IP, function() {
    log(`Server started in ${environment} mode.`);
    log(`Server home: http://${IP}:${PORT}/`);

    utils.refreshRates();

    new CronJob(`0 1 * * *`, function() {
        utils.refreshRates();
    }, null, true, 'America/Toronto');
});
