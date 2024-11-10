import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import defaultController from './controller/defaultController';
import { UserModel } from './shared/persistent/database/models';
import { logRequest } from './middleware/logRequest';
import { cors } from './middleware/cors';
import { getLogger } from './shared/common/logger';
import ContactDetailsModel from './shared/persistent/database/models/contactDetailsModel';
import SiteModel from './shared/persistent/database/models/siteModel';

const logger = getLogger();

export default async function (): Promise<express.Express> {
	const app = express();

	try {
		const mongoUrl = `mongodb://${process.env.DB_HOST ?? 'localhost'}:${
			process.env.DB_PORT ?? '27017'
		}/${process.env.DB_NAME ?? 'sysvisual'}`;

		mongoose.set('strictQuery', false);
		await mongoose.connect(mongoUrl, {
			connectTimeoutMS: 5000,
			auth: {
				username: process.env.DB_USERNAME,
				password: Buffer.from(
					process.env.DB_PASSWORD ?? '',
					'base64'
				).toString(),
			},
			authSource: 'admin',
		});

		await createDefaultUsers();

		logger.info('Successfully connected to the database.');
	} catch (error) {
		logger.error('Not successfully connected to the database.', { error });
	}

	app.use(express.json());
	app.use(cookieParser());
	app.use(logRequest);
	app.use(cors);
	app.use('/', defaultController);

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

	const environment = process.env.ENVIRONMENT;
	if (userCount <= 0) {
		const password =
			environment === 'LOCAL' ? 'admin' : generateAlphanumericStr(12);
		const username = environment === 'LOCAL' ? 'admin' : 'lasermatti';

		const contactDetails = await new ContactDetailsModel({
			email: 'admin@sysvisual.de',
			firstname: 'Administrator',
			surname: 'Sysvisual',
			addresses: [],
		}).save();

		const user = await new UserModel({
			username,
			password,
			contactDetails: contactDetails._id,
			createdAt: Date.now(),
		}).save();

		if (!user) {
			logger.error('Error occurred while creating default users.');
			return;
		}

		const site = await new SiteModel({
			name: environment === 'LOCAL' ? 'Localhost - Test' : 'Sysvisual Admin',
			domains:
				environment === 'LOCAL'
					? ['localhost:5174', 'localhost:5173']
					: ['admin.sysvisual.de'],
			owner: user._id,
		}).save();

		if (!site) {
			logger.error('Error occurred while creating default site.');
		}

		logger.info(
			`Created user with username: "${username}" and password: "${password}". !!! THIS INFO WILL NOT DISPLAYED ANOTHER TIME SAVE IT !!!"`
		);
	}
}
