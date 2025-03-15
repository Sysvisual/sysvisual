import { clearAuthCookie, setAuthCookie, verifyJWT } from '../shared/auth/jwt';
import { User } from '../shared/persistent/database/interface/User';
import bcrypt from 'bcrypt';
import { Router } from 'express';
import { WithId } from '../shared/persistent/objectMapper';
import { getUserByName } from '../shared/persistent/database/repository/UserRepository';
import { checkNoEmptyBody } from '../middleware/checkNoEmptyBody';
import { getSite } from '../shared/common/helpers/requestUtils';

const router = Router();

router.get('/is-logged-in', async (req, res) => {
	res.setHeader('Cache-Control', 'no-cache');

	if (!req.cookies.token) {
		return res.sendStatus(401);
	}

	if (verifyJWT(req.cookies.token)) {
		return res.sendStatus(200);
	} else {
		return res.sendStatus(401);
	}
});

router.post('/logout', async (_, res) => {
	res.setHeader('Cache-Control', 'no-cache');
	await clearAuthCookie(res);
	res.end();
});

router.post('/login', checkNoEmptyBody, async (req, res) => {
	res.setHeader('Cache-Control', 'no-cache');
	const site = getSite(req)._id.toString();

	const username = req.body.username;
	const password = req.body.password;

	if (username === undefined || password === undefined) {
		return res.sendStatus(400);
	}

	const user = await getUserByName(site, username);

	if (user.isError || !user.value) {
		return res.sendStatus(401);
	}

	if (await bcrypt.compare(password, user.value.password)) {
		await setAuthCookie(res, user as unknown as WithId<User>);
		res.sendStatus(200);
	} else {
		res.sendStatus(401);
	}
});

export default router;
