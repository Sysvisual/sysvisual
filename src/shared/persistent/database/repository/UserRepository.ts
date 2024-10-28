import { ErrorResult, resultFromError } from '../../../common/result';
import { PopulatedUser, User } from '../interface/User';
import { UserModel } from '../models';
import { Query } from 'mongoose';

const getUsers = async (
	siteId: string
): Promise<ErrorResult<PopulatedUser[]>> => {
	try {
		const dbQuery = UserModel.find({
			site: siteId,
		}).select(['_id', 'username', 'password', 'createdAt', 'contactDetails']);
		populateUser(dbQuery);
		const dbResult = (await dbQuery.exec()) as unknown as PopulatedUser[];

		return new ErrorResult(dbResult, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const getUserByName = async (
	siteId: string,
	username: string
): Promise<ErrorResult<PopulatedUser | undefined>> => {
	try {
		const dbQuery = UserModel.findOne({ site: siteId, username }).select([
			'_id',
			'username',
			'password',
			'createdAt',
			'contactDetails',
		]);
		populateUser(dbQuery);
		const dbResult = (await dbQuery.exec()) as unknown as PopulatedUser;

		if (!dbResult) {
			return new ErrorResult(undefined, null);
		}
		return new ErrorResult(dbResult, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const getUser = async (
	siteId: string,
	userId: string
): Promise<ErrorResult<PopulatedUser | undefined>> => {
	try {
		const dbQuery = UserModel.findOne({ site: siteId, _id: userId }).select([
			'_id',
			'username',
			'password',
			'createdAt',
			'contactDetails',
		]);
		populateUser(dbQuery);
		const dbResult = (await dbQuery.exec()) as unknown as PopulatedUser;

		if (!dbResult) {
			return new ErrorResult(undefined, null);
		}
		return new ErrorResult(dbResult, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const createUser = async (
	user: Omit<User, 'createdAt'>
): Promise<ErrorResult<string>> => {
	try {
		const userDocument = await UserModel.create({
			username: user.username,
			password: user.password,
			contactDetails: user.contactDetails,
			createdAt: new Date().getTime(),
		});

		return new ErrorResult(userDocument._id.toString(), null);
	} catch (error) {
		return resultFromError(error);
	}
};

const populateUser = (
	query: Query<unknown, unknown>
): Query<unknown, unknown> => {
	return query.populate({
		path: 'contactDetails',
		populate: {
			path: 'addresses',
		},
	});
};

export { getUsers, getUser, getUserByName, createUser };
