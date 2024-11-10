import { NextFunction, Request, Response } from 'express';

const cors = (req: Request, res: Response, next: NextFunction) => {
	const whitelistedOrigins = (
		(process.env.ALLOWED_HOSTS as string) ?? ''
	).split(',');

	const remoteHost = (req.headers.origin ?? req.headers.referer)?.replace(
		/\/$/,
		''
	);

	if (
		remoteHost !== undefined &&
		whitelistedOrigins.indexOf(remoteHost) !== -1
	) {
		res.setHeader('Access-Control-Allow-Origin', remoteHost);
		req.headers['X-Domain'] = getDomain(remoteHost);
		req.headers['X-Host'] = remoteHost;
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
