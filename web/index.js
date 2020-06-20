const polka = require('polka');

const log = require('another-logger')({label: 'web'});
const {MongoClient} = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const config = require('../config');
const responseHelpers = require('./middleware/responseHelpers');
const auth = require('./routes/auth');
const {default: sirv} = require('sirv');

(async () => {
	// Set up our app
	const app = polka();

	// Set up MongoDB
	const mongoClient = new MongoClient(config.mongodb.url, {useUnifiedTopology: true});
	await mongoClient.connect();
	log.success('Connected to MongoDB on', config.mongodb.url);

	// Set up session storage, delegated to parent process via IPC
	app.use(session({
		store: new MongoStore({
			client: mongoClient,
			dbName: config.mongodb.databaseName,
		}),
		secret: config.web.sessionSecret,
		saveUninitialized: false,
		resave: false,
	}));

	// Set up static serving of built frontend bundles
	app.use(sirv('./frontend/dist', {
		dev: config.dev,
	}));

	// Set up our other middlewares
	app.use(responseHelpers);

	// Register sub-apps for different routes
	app.use('/auth', auth);

	// Start the server
	app.listen(config.web.port, error => {
		if (error) {
			log.error(error);
			process.exit(1);
		}
		log.success(`Server listening on port ${config.web.port}`);
	});
})();
