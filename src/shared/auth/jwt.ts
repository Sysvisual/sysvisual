import { User } from '../../persistence/database/interface/User';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { CookieOptions, Response, Request } from 'express';
import { PopulatedSite } from '../../persistence/database/interface/Site';
import { WithId } from '../../persistence/objectMapper';
import { Config } from '../common/config/config';

const generateJWT = async (user: WithId<User>) => {
	return jwt.sign(
		{
			user: {
				username: user.username,
				id: user._id,
			},
		},
		Config.instance.config.jwtSecret,
		{
			algorithm: 'HS512',
			expiresIn: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2 hours
			issuer: 'sysvisual',
			audience: user.username ?? '',
		}
	);
};

const verifyJWT = (token?: string): boolean => {
	if (!token) {
		return false;
	}

	try {
		const decoded = jwt.verify(token, Config.instance.config.jwtSecret);
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
