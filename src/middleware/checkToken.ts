import { NextFunction, Request, Response } from 'express';
import { verifyJWT } from '../auth/jwt';

export const checkTokenMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies['token'];

	if (undefined === token || !verifyJWT(token)) {
		return res.sendStatus(401);
	}

	next();
};
