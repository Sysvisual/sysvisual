import { Router } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel';
import { User } from '../interface/User';
import { generateJWT } from '../utils/jwt';

const router = Router();

router.post('/login', async (req, res) => {
	if (!req.body) {
		return res.sendStatus(400);
	}

	console.log(req.body)

	const username = req.body.username;
	const password = req.body.password;

	if (username === undefined || password === undefined) {
		return res.sendStatus(400);
	}

	const user: User = (await userModel
		.findOne({ username })
		.select(['-_id', 'username', 'password'])
		.exec()) as unknown as User;

	if (user === null) {
		return res.sendStatus(401);
	}

	if (await bcrypt.compare(password, user.password)) {
		const token = await generateJWT(user);//generateAlphanumericStr(tokenLength);

		res.cookie('token', token, { maxAge: Math.floor((Date.now() / 1000) + (60 * 60 * 2)), sameSite: "none", secure: process.env.ENVIRONMENT !== 'LOCAL' });
		res.sendStatus(200);
	} else {
		res.sendStatus(401);
	}
});

export default router;
