const polka = require('polka');

const log = require('another-logger');
const {MongoClient} = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const config = require('../config');
const responseHelpers = require('./middleware/responseHelpers');
const auth = require('./routes/auth');

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
	app.use('/auth', auth);

	// very temporary testing route
	app.get('/', (request, response) => {
		response.end(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>dab on em</title>
				<meta charset="utf-8">
			</head>
			<body>
				${request.session.redditUserInfo ? `
					<p>logged into reddit as ${request.session.redditUserInfo.name} (<a href="/auth/reddit/logout">log out</a>)</p>
				` : `
					<p>not logged in with reddit, <a href="/auth/reddit">go log in</a></p>
				`}
				${request.session.discordUserInfo ? `
					<p>logged into discord as @${request.session.discordUserInfo.username}#${request.session.discordUserInfo.discriminator} (<a href="/auth/discord/logout">log out</a>)</p>
				` : `
					<p>not logged in with discord, <a href="/auth/discord">go log in</a></p>
				`}
				<p>oauth providers pls dont xss my website kthx</p>
			</body></html>
		`);
	});

	// Start the server
	app.listen(config.web.port, error => {
		if (error) {
			log.error(error);
			process.exit(1);
		}
		log.success(`Server listening on port ${config.web.port}`);
	});
})();
