let // PORT and IP where server listens
    PORT = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    IP = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || `0.0.0.0`,
    express = require(`express`), // Express server
    server = express(),
    log = function (message) { // Shorthand logging function
        console.log(`\n${message}`);
    },
    environment = server.get(`env`); // Environment (production or development) where server is being deployed

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

server.use(function (req, res, next) {
    //switch (req.subdomains[0]) {
    //    case `www`:
            server.set(`static`, `./static/home`);
            server.use(`/`, express.static(__dirname + `/static/home`));
            break;
    /*    case `ryan`:
            server.set(`static`, `./static/ryan`);
            server.use(`/`, express.static(__dirname + `/static/ryan`));
            break;
        default:
            server.set(`static`, `./static/home`);
            server.use(`/`, express.static(__dirname + `/static/home`));
    }*/
    next();
});

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
// Openshift V2 DB URL
if (process.env.OPENSHIFT_MONGODB_DB_USERNAME) {
    mongoURL = `mongodb://` +
            `${process.env.OPENSHIFT_MONGODB_DB_USERNAME}:` +
            `${process.env.OPENSHIFT_MONGODB_DB_PASSWORD}@` +
            `${process.env.OPENSHIFT_MONGODB_DB_HOST}:` +
            `${process.env.OPENSHIFT_MONGODB_DB_PORT}/` +
            process.env.OPENSHIFT_APP_NAME;
}
// Openshift V3 DB URL
if (mongoURL == null && process.env.MONGODB_USER) {
    mongoURL = `mongodb://` +
    `${process.env.MONGODB_USER}:` +
    `${process.env.MONGODB_PASSWORD}@` +
    `${process.env.MONGODB_IP}:` +
    `${process.env.MONGODB_PORT}/` +
    process.env.MONGODB_DATABASE;
} else if (mongoURL == null) {
    mongoURL = `mongodb://admin:vyiNhzRX4qPE@127.0.0.1:27017/instapay`; // Local DB
}

/*if (server.get(`env`) === `production`) {
    mongoURL += `?ssl=true`; // Secure connection to MongoDB
}*/

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
            name: "instapaysession",
            genid: function(req) {
                return uuid.v1(); // use unique id for sessions
            },
            secret: "Signed by ryan872 @ Matrians",
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
        if (environment === `production`) {
            server.set(`trust proxy`, 1); // trust first proxy
            sess.cookie.secure = true; // serve secure cookies
            sess.cookie.httpOnly = true;
        }
        server.use(session(sess));

        module.db = db;
        module.ObjectId = require(`mongodb`).ObjectId;
        module.log = log;

        /*module.users = require(`./bin/db-users.js`);
        module.vendors = require(`./bin/db-vendors.js`);
        module.orders = require(`./bin/db-orders.js`);

        server.use(`/`, require(`./bin/ep-post.js`));
        server.use(`/`, require(`./bin/ep-get.js`));*/

        console.log(`Connected successfully to database.`);
    } else console.log(`Database error: ${err.message}`);
});

server.listen(PORT, IP, function() {
    log(`Server started in ${environment} mode.`);
    log(`Server home: http://${IP}:${PORT}/`);
});
