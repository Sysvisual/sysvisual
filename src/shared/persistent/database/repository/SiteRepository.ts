import { Query } from 'mongoose';
import { ErrorResult, resultFromError } from '../../../common/helpers/result';
import { PopulatedSite } from '../interface/Site';
import { SiteModel } from '../models';

const getSites = async (
	ownerId: string
): Promise<ErrorResult<PopulatedSite[]>> => {
	try {
		const dbQuery = SiteModel.find({ owner: ownerId }).select([
			'_id',
			'name',
			'owner',
			'domains',
		]);
		populateSites(dbQuery);
		const dbResult = (await dbQuery.exec()) as unknown as PopulatedSite[];

		return new ErrorResult(dbResult, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const populateSites = (
	query: Query<unknown, unknown>
): Query<unknown, unknown> => {
	return query.populate({
		path: 'owner',
		populate: {
			path: 'contactDetails',
			populate: {
				path: 'addresses',
			},
		},
	});
};

export { getSites };
