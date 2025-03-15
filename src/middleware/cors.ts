import { NextFunction, Request, Response } from 'express';
import { Config } from '../shared/common/config/config';

const cors = (req: Request, res: Response, next: NextFunction) => {
	// TODO: Move allowed Hosts into database
	const whitelistedOrigins = Config.instance.config.allowedHosts;

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
	} else {
		return res.end();
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
