import { NextFunction, Request, Response } from 'express';
import { Config } from '../shared/common/config/config';
import { Logger } from '../shared/common/logging/logger';

const logger = Logger.instance.getLogger();

const cors = (req: Request, res: Response, next: NextFunction) => {
	const whitelistedOrigins = Config.instance.config.allowedHosts;

	const remoteHost = (req.headers.origin ?? req.headers.referer)?.replace(
		/\/$/,
		''
	);

	if (Config.instance.config.environment === 'LOCAL') {
		if (req.headers['host']?.startsWith('localhost')) {
			return next();
		} else {
			return res.end();
		}
	}

	if (
		remoteHost !== undefined &&
		whitelistedOrigins.indexOf(remoteHost) !== -1
	) {
		res.setHeader('Access-Control-Allow-Origin', remoteHost);
		req.headers['X-Domain'] = getDomain(remoteHost);
		req.headers['X-Host'] = remoteHost;
	} else {
		logger.warn(`Got request from unknown remoteHost ${remoteHost}`, {
			remoteHost,
		});
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
