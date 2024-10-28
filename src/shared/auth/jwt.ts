import { User } from '../persistent/database/interface/User';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CookieOptions, Response, Request } from 'express';
import { PopulatedSite } from '../persistent/database/interface/Site';
import { WithId } from '../persistent/objectMapper';

const generateJWT = async (user: WithId<User>) => {
	if (!process.env.JWT_SECRET) {
		throw new Error('Cannot generate JWT: Missing secret in .env!');
	}
	return jwt.sign(
		{
			user: {
				username: user.username,
				id: user._id,
			},
		},
		process.env.JWT_SECRET,
		{
			algorithm: 'HS512',
			expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2 hours
			issuer: 'sysvisual',
			audience: user.username,
		}
	);
};

const verifyJWT = (token?: string): boolean => {
	if (!token) {
		return false;
	}
	if (!process.env.JWT_SECRET) {
		throw new Error('Cannot verify JWT: Missing secret in .env!');
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return !!decoded;
	} catch (_) {
		return false;
	}
};

const getJWTPayload = (token?: string): JwtPayload | undefined | null => {
	if (!token) {
		return undefined;
	}

	try {
		return jwt.decode(token, { json: true });
	} catch (_) {
		return undefined;
	}
};

const setAuthCookie = async (res: Response, user: WithId<User>) => {
	const token = await generateJWT(user);

	const cookieOptions: CookieOptions = {
		expires: new Date(Date.now() + 60 * 60 * 2 * 1000),
		sameSite: 'none',
		secure: true,
		httpOnly: true,
	};

	res.cookie('token', token, cookieOptions);
};

const clearAuthCookie = async (res: Response) => {
	const cookieOptions: CookieOptions = {
		expires: new Date(0),
		sameSite: 'none',
		secure: true,
		httpOnly: true,
	};

	res.cookie('token', '', cookieOptions);
};

const checkAuth = (req: Request): boolean => {
	const token = req.cookies['token'];
	const site = req.headers['X-Site'] as unknown as PopulatedSite;
	const payload = getJWTPayload(token);

	if (!payload) {
		return false;
	}

	return verifyJWT(token) && payload.user.id === site.owner._id.toString();
};

export {
	generateJWT,
	verifyJWT,
	setAuthCookie,
	clearAuthCookie,
	checkAuth,
	getJWTPayload,
};
