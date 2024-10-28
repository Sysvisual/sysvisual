import { NextFunction, Request, Response } from 'express';

const cors = (req: Request, res: Response, next: NextFunction) => {
	const whitelistedOrigins = (
		(process.env.ALLOWED_HOSTS as string) ?? ''
	).split(',');

	if (
		req.headers.origin !== undefined &&
		whitelistedOrigins.indexOf(req.headers.origin) !== -1
	) {
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
		req.headers['X-Domain'] = getDomain(req.headers.origin);
		req.headers['X-Host'] = req.headers.host;
	}

	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Accept, Origin, X-Requested-With'
	);
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, PATCH, DELETE, OPTIONS'
	);

	if ('OPTIONS' === req.method) {
		res.sendStatus(200);
	} else {
		next();
	}
};

function getDomain(origin: string): string {
	return origin.split('://')[1]?.split('/')[0];
}

export { cors };
