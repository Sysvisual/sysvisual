import { Category, PopulatedCategory } from '../interface/Category';
import { ErrorResult, resultFromError } from '../../../common/result';
import { CategoryModel } from '../models';
import { Query } from 'mongoose';
import { WithId } from '../../objectMapper';

const getCategories = async (
	siteId: string,
	showHidden = false
): Promise<ErrorResult<PopulatedCategory[]>> => {
	try {
		const dbQuery = CategoryModel.find({ site: siteId }).select([
			'_id',
			'name',
			'description',
			'items',
		]);

		populateCategory(dbQuery, showHidden);

		const dbResult = (await dbQuery.exec()) as unknown as PopulatedCategory[];
		return new ErrorResult(dbResult, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const getCategory = async (
	siteId: string,
	categoryId: string,
	showHidden = false
): Promise<ErrorResult<PopulatedCategory>> => {
	try {
		const dbQuery = CategoryModel.findOne({
			site: siteId,
			_id: categoryId,
		}).select(['_id', 'name', 'description', 'items']);

		populateCategory(dbQuery, showHidden);

		const dbResult = (await dbQuery.exec()) as unknown as PopulatedCategory;
		return new ErrorResult(dbResult, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const deleteCategory = async (
	siteId: string,
	categoryId: string
): Promise<ErrorResult<boolean>> => {
	try {
		await CategoryModel.deleteOne({
			site: siteId,
			_id: categoryId,
		});

		return new ErrorResult(true, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const updateCategory = async (
	siteId: string,
	category: WithId<Omit<Category, 'site'>>
): Promise<ErrorResult<boolean>> => {
	try {
		await CategoryModel.updateOne(
			{
				site: siteId,
				_id: category._id,
			},
			{
				name: category.name,
				description: category.description,
				items: category.items,
			}
		);

		return new ErrorResult(true, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const createCategory = async (
	siteId: string,
	category: Omit<Category, 'site'>
): Promise<ErrorResult<string>> => {
	try {
		const categoryDocument = await CategoryModel.create({
			name: category.name,
			description: category.description,
			items: category.items,
			site: siteId,
		});

		return new ErrorResult(categoryDocument._id.toString(), null);
	} catch (error) {
		return resultFromError(error);
	}
};

const populateCategory = (
	query: Query<unknown, unknown>,
	showHidden: boolean
): Query<unknown, unknown> => {
	if (showHidden) {
		return query.populate('items');
	}
	return query.populate({
		path: 'items',
		match: { hidden: false },
	});
};

export {
	getCategories,
	getCategory,
	deleteCategory,
	updateCategory,
	createCategory,
};
