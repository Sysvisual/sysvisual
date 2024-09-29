import { NextFunction, Request, Response } from 'express';

const _logRequest = (req: Request, _: Response, next: NextFunction) => {
	let bodyStr = undefined;

	if (['POST', 'PATCH'].includes(req.method) && req.body) {
		bodyStr = `with parameters ${JSON.stringify(req.body)} `;
	}

	if (/login/.test(req.path) && req.method !== 'OPTIONS') {
		bodyStr = `with readacted body content`;
	}

	console.log(`Got request for ${req.method} ${req.path} ${bodyStr ?? ''}`);
	next();
};

export const logRequest = _logRequest;
