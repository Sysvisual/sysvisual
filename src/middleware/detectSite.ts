import { NextFunction, Request, Response } from 'express';
import { SiteModel } from '../persistence/database/models';
import { Logger } from '../shared/common/logging/logger';

const logger = Logger.instance.getLogger();

export const detectSite = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const forSite = req.query.forSite as string | undefined;
		let domain = req.headers['X-Domain'];
		if (forSite) {
			domain = forSite;
		}

		if (!domain) {
			return res.sendStatus(404);
		}

		const site = await SiteModel.findOne({
			domains: { $in: [domain] },
		})
			.populate('owner')
			.exec();

		if (!site) {
			return res.sendStatus(404);
		}

		req.headers['X-Site'] = site as unknown as string;
		next();
	} catch (error) {
		const domain = req.headers['X-Host'];
		if (error instanceof Error) {
			logger.warn(`Site not found for ${domain}}`, { error: { ...error } });
		}
		logger.warn(`Unexpected throw while fetching Site for ${domain}`, {
			error,
		});
		res.sendStatus(500);
	}
};
