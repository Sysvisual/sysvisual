import { NextFunction, Request, Response } from 'express';
import { getLogger } from '../utils';

const logger = getLogger();

export const logRequest = (req: Request, _: Response, next: NextFunction) => {
	let bodyStr = undefined;

	if (['POST', 'PATCH'].includes(req.method) && req.body) {
		bodyStr = `with parameters ${JSON.stringify(req.body)} `;
	}

	if (/login/.test(req.path) && req.method !== 'OPTIONS') {
		bodyStr = `with readacted body content`;
	}

	logger.info(`Got request for ${req.method} ${req.path} ${bodyStr ?? ''}`);
	next();
};
