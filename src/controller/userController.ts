import { Router } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel';
import { User } from '../interface/User';
import { generateAlphanumericStr } from '../utils';

const tokens: Map<string, number> = new Map();
const tokenLength = 128;
const maxAge = 1000 * 60 * 60; // 1000 (ms) * 60 (s) * 60 (m)

const router = Router();

router.post('/:user/login', async (req, res) => {
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

	if (user === undefined) {
		return res.sendStatus(401);
	}

	if (await bcrypt.compare(password, user.password)) {
		const token = generateAlphanumericStr(tokenLength);

		tokens.set(token, new Date().getTime() + maxAge);
		res.cookie('token', token, { maxAge: maxAge });
		res.sendStatus(200);
	} else {
		res.sendStatus(401);
	}
});

export default router;
export function checkToken(token: string): boolean {
	const expiresAt = tokens.get(token);
	if (expiresAt === undefined) {
		return false;
	}
	return new Date().getTime() - expiresAt < 0;
}

export async function clearExpiredTokens() {
	for (const key of tokens.keys()) {
		if (new Date().getTime() - (tokens.get(key) ?? 0) > 0) {
			tokens.delete(key);
		}
	}
}
