import { NextFunction, Request, Response } from 'express';
import { getJWTPayload, verifyJWT } from '../shared/auth/jwt';

export const checkTokenMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies['token'];

	if (undefined === token || !verifyJWT(token)) {
		return res.sendStatus(401);
	}

	req.headers['X-JWT-Payload'] = getJWTPayload(token) as unknown as string;
	next();
};
