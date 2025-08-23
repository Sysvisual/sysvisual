import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose, { Types } from 'mongoose';

import defaultController from './controller/defaultController';
import { UserModel } from './persistence/database/models';
import { logRequest } from './middleware/logRequest';
import { cors } from './middleware/cors';
import { Logger } from './shared/common/logging/logger';
import ContactDetailsModel from './persistence/database/models/contactDetailsModel';
import SiteModel from './persistence/database/models/siteModel';

import promBundle from 'express-prom-bundle';
import { Config } from './shared/common/config/config';
import { Postgres } from './persistence/database/postgres';
import compression from 'compression';

const logger = Logger.instance.getLogger();

export default async function (): Promise<express.Express> {
	const app = express();
	const cfg = Config.instance.config;

	try {
		const mongoUrl = `mongodb://${cfg.mongodb.host}:${
			cfg.mongodb.port
		}/${cfg.mongodb.name}`;

		mongoose.set('strictQuery', false);
		await mongoose.connect(mongoUrl, {
			connectTimeoutMS: 5000,
			auth: {
				username: cfg.mongodb.username,
				password: cfg.mongodb.password,
			},
			authSource: 'admin',
		});

		await createDefaultUsers();

		Postgres.init();
	} catch (error) {
		logger.error(
			'Not successfully connected to the database. Stopping server!',
			{ error }
		);
		process.exit(1);
	}

	app.use(
		promBundle({
			includeMethod: true,
			includePath: true,
			includeStatusCode: true,
			includeUp: true,
			customLabels: {
				project_name: 'sysvisual',
				service: 'sysvisual',
			},
			promClient: {
				collectDefaultMetrics: {},
			},
		})
	);
	app.use(compression());
	app.use(cors);
	app.use(logRequest);
	app.use(express.json());
	app.use(cookieParser());
	app.use('/', defaultController);
	app.use('/assets', express.static('assets'));

	return app;
}

// TODO: Deprecate this function, create default user directly inside the database instead of through code
async function createDefaultUsers(): Promise<void> {
	const generateAlphanumericStr = (length: number = 12): string => {
		if (length < 1) {
			throw new Error('Password length can not be shorter than 1 character!');
		}
		const ALPHANUMERIC =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		const possibleCharacters = ALPHANUMERIC.length;
		let result = '';
		for (let i = 0; i < length; i++) {
			result += ALPHANUMERIC.charAt(Math.random() * possibleCharacters);
		}

		return result;
	};

	const userCount = await UserModel.count().exec();

	const environment = Config.instance.config.environment;
	if (userCount <= 0) {
		const password =
			environment === 'LOCAL' ? 'admin' : generateAlphanumericStr(12);
		const username = environment === 'LOCAL' ? 'admin' : 'lasermatti';

		const contactDetails = await ContactDetailsModel.create({
			email: 'admin@sysvisual.de',
			firstname: 'Administrator',
			surname: 'Sysvisual',
			addresses: [],
		});

		const userId = Types.ObjectId.createFromTime(new Date().getTime() / 1000);
		const siteId = Types.ObjectId.createFromTime(
			(new Date().getTime() + 1) / 1000
		);

		const user = await UserModel.create({
			_id: userId,
			username,
			password,
			contactDetails: contactDetails._id,
			createdAt: Date.now(),
			site: siteId,
		});

		if (!user) {
			logger.error('Error occurred while creating default users.');
			return;
		}

		const site = await SiteModel.create({
			_id: siteId,
			name: environment === 'LOCAL' ? 'Localhost - Test' : 'Sysvisual Admin',
			domains:
				environment === 'LOCAL'
					? ['localhost:5174', 'localhost:5173']
					: ['admin.sysvisual.de'],
			owner: userId,
		});

		if (!site) {
			logger.error('Error occurred while creating default site.');
			return;
		}

		logger.info(
			`Created user with username: "${username}" and password: "${password}". !!! THIS INFO WILL NOT DISPLAYED ANOTHER TIME SAVE IT !!!"`
		);
	}
}
