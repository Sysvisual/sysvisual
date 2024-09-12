import { NextFunction, Request, Response } from 'express';
import { checkToken } from '../controller/userController';

export const checkTokenMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies['token'];

	if (undefined === token || !checkToken(token)) {
		return res.sendStatus(401);
	}

	next();
};
