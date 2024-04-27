import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import defaultController from './controller/defaultController';
import userModel from './models/userModel';
import { generateAlphanumericStr } from './utils';
import { clearExpiredTokens } from './controller/userController';

export default async function (): Promise<express.Express> {
	const app = express();

	try {
		const mongoUrl = `mongodb://${process.env.DB_HOST ?? 'localhost'}:${
			process.env.DB_PORT ?? '27017'
		}/${process.env.DB_NAME ?? 'lasermatti'}`;

		await mongoose.connect(mongoUrl, {
			connectTimeoutMS: 5000,
			auth: {
				username: process.env.DB_USERNAME,
				password: process.env.DB_PASSWORD,
			}
		});

		createDefaultUsers();

		console.log('Successfully connected to the database.');
	} catch (error) {
		console.log('Not successfully connected to the database.');
		console.log(error);
	}

	console.log(`Uploaded files will be saved to: ${process.env.FILE_UPLOAD_DEST}`);
	

	app.use(express.json());
	app.use(cookieParser());
	app.use((req, res, next) => {
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
		res.setHeader(
			'Access-Control-Allow-Methods',
			'GET, POST, PATCH, DELETE, OPTIONS'
		);

		if ('OPTIONS' === req.method) res.sendStatus(200);
		else next();
	});
	app.use((req, res, next) => {
		let bodyStr = undefined;

		if (['POST', 'PATCH'].includes(req.method) && req.body) {
			bodyStr = `with parameters ${JSON.stringify(req.body)} `;
		}

		if (/\w+\/login/.test(req.path)) {
			bodyStr = `with readacted body content`;
		}

		console.log(`Got request for ${req.path} ${bodyStr ?? ''}`);
		next();
	});
	app.use('/', defaultController);

	setTimeout(clearExpiredTokens, 1000 * 60 * 60 * 24);

	return app;
}

async function createDefaultUsers(): Promise<void> {
	const userCount = await userModel.count().exec();

	if (userCount <= 0) {
		const password = generateAlphanumericStr(12);
		const username = 'lasermatti';

		const user = new userModel({
			username,
			password,
		});

		const savedUser = await user.save();
		if (!savedUser) {
			console.error('Error occured while creating default users!');
			return;
		}

		console.log(
			`Created user with username: "${username}" and password: "${password}". !!! THIS INFO WILL NOT DISPLAYED ANOTHER TIME SAVE IT !!!"`
		);
	}
}
