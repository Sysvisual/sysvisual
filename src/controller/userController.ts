import { CookieOptions, Router } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel';
import { User } from '../interface/User';
import { generateJWT, verifyJWT } from '../utils/jwt';

const router = Router();

router.get('/is-logged-in', async (req, res) => {
	res.setHeader('Cache-Control', 'no-cache');

	if (!req.cookies.token) {
		return res.sendStatus(401);
	}

	if (await verifyJWT(req.cookies.token as string)) {
		return res.sendStatus(200);
	} else {
		return res.sendStatus(401);
	}
});

router.post('/login', async (req, res) => {
	if (!req.body) {
		return res.sendStatus(400);
	}

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
		const token = await generateJWT(user);

		const cookieOptions: CookieOptions = {
			maxAge: 60 * 60 * 2 * 1000,
			sameSite: 'none',
			secure: true,
			httpOnly: true,
		};

		res.cookie('token', token, cookieOptions);
		res.sendStatus(200);
	} else {
		res.sendStatus(401);
	}
});

export default router;
