const polka = require('polka');

const log = require('another-logger');
const {MongoClient} = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const config = require('../config');
const responseHelpers = require('./middleware/responseHelpers');
const redditAuth = require('./routes/redditAuth');

(async () => {
	// Set up MongoDB
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	const db = mongoClient.db(config.mongodb.databaseName);

	// Set up our app
	const app = polka();

	// Set up per-session storage in MongoDB
	const sessionStore = new MongoStore({
		client: mongoClient,
		dbName: config.mongodb.databaseName,
	});
	app.use(session({
		store: sessionStore,
		secret: config.web.sessionSecret,
		saveUninitialized: false,
		resave: false,
	}));

	// Set up our other middlewares
	app.use(responseHelpers);

	// Register sub-apps for different routes
	app.use('/auth', redditAuth);

	// Start the server
	app.listen(config.web.port, error => {
		if (error) {
			log.error(error);
			process.exit(1);
		}
		log.success(`Server listening on port ${config.web.port}`);
	});
})();
