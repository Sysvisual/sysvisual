import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import defaultController from './controller/defaultController';
import UserModel from './models/userModel';
import { generateAlphanumericStr } from './utils';
import { logRequest } from './middleware/logRequest';
import { cors } from './middleware/cors';

export default async function (): Promise<express.Express> {
	const app = express();

	try {
		const mongoUrl = `mongodb://${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '27017'
			}/${process.env.DB_NAME ?? 'sysvisual'}`;

		await mongoose.connect(mongoUrl, {
			connectTimeoutMS: 5000,
			auth: {
				username: process.env.DB_USERNAME,
				password: process.env.DB_PASSWORD,
			},
			authSource: 'admin'
		});

		await createDefaultUsers();

		console.log('Successfully connected to the database.');
	} catch (error) {
		console.log('Not successfully connected to the database.');
		console.log(error);
	}

	console.log(`Uploaded files will be saved to: ${process.env.FILE_UPLOAD_DEST}`);

	app.use(express.json());
	app.use(cookieParser());
	app.use(logRequest);
	app.use(cors);
	app.use('/', defaultController);

	return app;
}

async function createDefaultUsers(): Promise<void> {
	const userCount = await UserModel.count().exec();

	if (userCount <= 0) {
		const password = generateAlphanumericStr(12);
		const username = 'lasermatti';

		const user = new UserModel({
			username,
			password,
		});

		const savedUser = await user.save();
		if (!savedUser) {
			console.error('Error occurred while creating default users!');
			return;
		}

		console.log(
			`Created user with username: "${username}" and password: "${password}". !!! THIS INFO WILL NOT DISPLAYED ANOTHER TIME SAVE IT !!!"`
		);
	}
}
