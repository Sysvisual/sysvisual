import { User } from '../interface/User';
import jwt from 'jsonwebtoken';

const generateJWT = async (user: User) => {
	if (!process.env.JWT_SECRET) {
		throw new Error('Cannot generate JWT: Missing secret in .env!');
	}
	return jwt.sign(
		{
			user: {
				username: user.username,
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

const verifyJWT = async (token?: string): Promise<boolean> => {
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

export { generateJWT, verifyJWT };
