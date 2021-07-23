import polka from 'polka';

import createLogger from 'another-logger';
const log = createLogger({label: 'web'});
import session from 'express-session';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);

import config from '../../config';
import responseHelpers from './middleware/responseHelpers';
import logging from './middleware/logging';
import auth from './routes/auth';
import api from './routes/api';
import sirv from 'sirv';

export default (mongoClient, db, discordClient) => {
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
		dev: config.dev,
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
