import { Router } from 'express';
import { getLogger } from '../shared/common/logger';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { mapSiteToDTO, WithId } from '../shared/persistent/objectMapper';
import { PopulatedSite } from '../shared/persistent/database/interface/Site';
import { getJWTPayload } from '../shared/common/requestUtils';
import { getSites } from '../shared/persistent/database/repository/SiteRepository';

const router = Router();
const logger = getLogger();

router.get('/', checkTokenMiddleware, async (req, res) => {
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
});

export default router;
