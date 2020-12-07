const polka = require('polka');

const log = require('another-logger')({label: 'web'});
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const config = require('../../config');
const responseHelpers = require('./middleware/responseHelpers');
const logging = require('./middleware/logging');
const auth = require('./routes/auth');
const api = require('./routes/api');
const sirv = require('sirv');

module.exports = (mongoClient, db, discordClient) => {
	// Set up our app
	const app = polka();

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

	app.use(logging);

	// Set up static serving of built frontend bundles
	app.use(sirv(config.web.frontendBuildDir, {
		dev: process.env.NODE_ENV !== 'production',
		single: true,
		ignores: [
			'/api',
			'/auth',
		],
	}));

	// Set up our other middlewares
	app.use(responseHelpers);

	// Register sub-apps for API routes
	app.use('/auth', auth);
	app.use('/api', api(db, discordClient));

	// Start the server
	app.listen(config.web.port, error => {
		if (error) {
			log.error(error);
			process.exit(1);
		}
		log.success(`Server listening on port ${config.web.port}`);
	});
};
