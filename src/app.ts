import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import defaultController from './controller/defaultController';
import UserModel from './models/userModel';
import { generateAlphanumericStr, getLogger } from './utils';
import { logRequest } from './middleware/logRequest';
import { cors } from './middleware/cors';

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

async function createDefaultUsers(): Promise<void> {
	const userCount = await UserModel.count().exec();

	const environment = process.env.ENVIRONMENT;
	if (userCount <= 0) {
		const password =
			environment === 'LOCAL' ? 'admin' : generateAlphanumericStr(12);
		const username = environment === 'LOCAL' ? 'admin' : 'lasermatti';

		const user = new UserModel({
			username,
			password,
		});

		const savedUser = await user.save();
		if (!savedUser) {
			logger.error('Error occurred while creating default users!');
			return;
		}

		console.info(
			`Created user with username: "${username}" and password: "${password}". !!! THIS INFO WILL NOT DISPLAYED ANOTHER TIME SAVE IT !!!"`
		);
	}
}
