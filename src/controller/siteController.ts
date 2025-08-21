import { Router } from 'express';
import { Logger } from '../shared/common/logging/logger';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { mapSiteToDTO, WithId } from '../persistence/objectMapper';
import { PopulatedSite } from '../persistence/database/interface/Site';
import { getJWTPayload } from '../shared/common/helpers/requestUtils';
import { getSites } from '../persistence/database/repository/SiteRepository';
import { renderSite } from '../domain/siteRenderer/SiteRenderService';
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

router.get('/:siteName', async (req, res) => {
	const properties = {
		'language': 'en',
		'site title': 'Test Site',
	};

	const renderedSite = renderSite([], properties);

	if (renderedSite.isError) {
		res.sendStatus(400);
	} else {
		res.status(200).send(renderedSite.value);
	}
});

export default router;
