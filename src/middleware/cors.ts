import { NextFunction, Request, Response } from 'express';

const cors = (req: Request, res: Response, next: NextFunction) => {
	const whitelistedOrigins = [
		'http://localhost:5173',
		'http://localhost:5174'
	]

	if (req.headers.origin !== undefined && whitelistedOrigins.indexOf(req.headers.origin) !== -1) {
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
	}

	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS'
	);

	if ('OPTIONS' === req.method) res.sendStatus(200);
	else next();
}

export {
	cors
}