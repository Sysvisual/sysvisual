import { Router } from 'express';
import { Logger } from '../shared/common/logging/logger';
import { mapSiteToDTO, WithId } from '../persistence/objectMapper';
import { PopulatedSite } from '../persistence/database/interface/Site';
import { getJWTPayload } from '../shared/common/helpers/requestUtils';
import { getSites } from '../persistence/database/repository/SiteRepository';
import {
	renderFromObject,
	SiteDefinition,
} from '../domain/siteRenderer/SiteRenderService';
import fs from 'fs';

const router = Router();
const logger = Logger.instance.getLogger();

router.get(
	'/',
	/* checkTokenMiddleware,*/ async (req, res) => {
		try {
			const owner = getJWTPayload(req).user.id as string;
			const sites = await getSites(owner);

			if (sites.isError) {
				return res.sendStatus(500);
			}

			const result = sites.value?.map((s) =>
				mapSiteToDTO(s as unknown as WithId<PopulatedSite>)
			);

			return res.status(200).json(result ?? []);
		} catch (error) {
			if (error instanceof Error) {
				logger.error('Unexpected error during call to GET /sites/', {
					error: { ...error },
				});
			} else {
				logger.error('Unexpected error during call to GET /sites/', { error });
			}
			res.sendStatus(500);
		}
	}
);

let siteDefinitionStr = fs.readFileSync('templates/site.json').toString('utf8');
(async () => {
	fs.watchFile('templates/site.json', async (_) => {
		siteDefinitionStr = fs.readFileSync('templates/site.json').toString('utf8');
		console.log('Reloaded site definition');
	});
})();

router.get('/:siteName', async (req, res) => {
	try {
		const renderedSite = renderFromObject(
			JSON.parse(siteDefinitionStr) as unknown as SiteDefinition
		);

		if (renderedSite.isError) {
			res.sendStatus(400);
		} else {
			res.status(200).send(renderedSite.value);
		}
	} catch (error) {
		logger.error('Unexpected error while rendering site', { error });
		res.sendStatus(500);
	}
});

export default router;
