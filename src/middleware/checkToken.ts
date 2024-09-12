import { NextFunction, Request, Response } from 'express';
import { verifyJWT } from '../utils/jwt';

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
