import { NextFunction, Request, Response } from 'express';

export const checkNoEmptyBody = (req: Request, res: Response, next: NextFunction) => {
	if (!req.body) {
		return res.sendStatus(400);
	}
	next();
}