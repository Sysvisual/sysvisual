import { CategoryModel, ProductModel } from '../models';
import { ErrorResult, resultFromError, Result } from '../../../common/result';
import { PopulatedProduct, Product } from '../interface/Product';
import { Query } from 'mongoose';
import fs from 'fs';
import { WithId } from '../../objectMapper';
import { deleteImages as deleteImagesFS } from '../../fileHandler';

const getProduct = async (
	siteId: string,
	productId: string,
	showHidden = false
): Promise<ErrorResult<PopulatedProduct | undefined>> => {
	try {
		const dbQuery = ProductModel.findOne({
			_id: productId,
			site: siteId,
		}).select([
			'_id',
			'title',
			'description',
			'price',
			'hidden',
			'images',
			'categories',
			'site',
		]);
		populateProduct(dbQuery);
		const dbResult = (await dbQuery.exec()) as unknown as PopulatedProduct;

		if (!dbResult || (!showHidden && dbResult.hidden)) {
			return new ErrorResult<PopulatedProduct | undefined>(undefined, null);
		}
		return new ErrorResult(dbResult, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const getProducts = async (
	siteId: string,
	showHidden = false
): Promise<ErrorResult<PopulatedProduct[]>> => {
	try {
		const dbQuery = ProductModel.find({
			site: siteId,
		}).select([
			'_id',
			'title',
			'description',
			'price',
			'hidden',
			'images',
			'categories',
			'site',
		]);
		populateProduct(dbQuery);
		const dbResult = (await dbQuery.exec()) as unknown as PopulatedProduct[];

		const result = dbResult.filter((p) =>
			showHidden ? true : !p.hidden
		) as unknown as PopulatedProduct[];

		return new ErrorResult(result, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const createProduct = async (
	product: Product
): Promise<ErrorResult<string>> => {
	try {
		const productDocument = await ProductModel.create({
			title: product.title,
			description: product.description,
			hidden: product.hidden,
			price: (product.price * 100).toFixed(2),
			images: product.images,
			site: product.site,
		});

		return new ErrorResult(productDocument._id.toString(), null);
	} catch (error) {
		return resultFromError(error);
	}
};

const deleteProduct = async (
	siteId: string,
	productId: string
): Promise<ErrorResult<boolean>> => {
	try {
		const product = await ProductModel.findOneAndDelete({
			_id: productId,
			site: siteId,
		});

		if (!product) {
			return new Result(false, null);
		}

		const dirSet = new Set();

		for (const image of product.images) {
			dirSet.add(image.split(/\//)[0]);
		}

		if (product.images.length > 0) {
			for (const dir of dirSet) {
				fs.rmSync(`${process.env.FILE_UPLOAD_DEST}/${dir}`, {
					force: true,
					recursive: true,
				});
			}
		}

		if (product.categories.length > 0) {
			await CategoryModel.updateMany(
				{},
				{
					$pull: {
						items: {
							$in: product._id.toString(),
						},
					},
				},
				{ new: true }
			);
		}

		return new Result(true, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const updateProduct = async (
	siteId: string,
	product: WithId<Omit<Product, 'categories' | 'site'>>
): Promise<ErrorResult<boolean>> => {
	try {
		const oldProduct = await ProductModel.findOneAndUpdate(
			{ _id: product._id.toString(), site: siteId },
			{
				title: product.title,
				description: product.description,
				hidden: product.hidden,
				images: product.images,
				price: (product.price * 100).toFixed(2),
			}
		);

		if (!oldProduct) {
			return new Result(false, null);
		}

		const removedImages = oldProduct.images.filter(
			(img) => !product.images.includes(img)
		);
		await deleteImages(siteId, ...removedImages);

		return new Result(true, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const updateCategories = async (
	siteId: string,
	categoryId: string,
	items: string[]
): Promise<ErrorResult<boolean>> => {
	try {
		await Promise.all([
			ProductModel.updateMany(
				{
					site: siteId,
					_id: { $nin: items },
				},
				{ $pull: { categories: categoryId } }
			),
			ProductModel.updateMany(
				{
					site: siteId,
					_id: { $in: items },
				},
				{ $addToSet: { categories: categoryId } }
			),
		]);
		return new ErrorResult(true, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const deleteImages = async (
	siteId: string,
	...imagePaths: string[]
): Promise<ErrorResult<boolean>> => {
	try {
		const promises: Array<Promise<unknown>> = [];
		for (const image of imagePaths) {
			promises.push(
				ProductModel.updateMany(
					{ site: siteId },
					{ $pull: { images: { $in: image } } }
				).exec()
			);
		}

		await Promise.all(promises);
		deleteImagesFS(imagePaths);

		return new ErrorResult(true, null);
	} catch (error) {
		return resultFromError(error);
	}
};

const populateProduct = (
	query: Query<unknown, unknown>
): Query<unknown, unknown> => {
	return query.populate({
		path: 'site',
		populate: {
			path: 'owner',
			populate: {
				path: 'contactDetails',
				populate: {
					path: 'addresses',
				},
			},
		},
	});
};

export {
	getProduct,
	getProducts,
	createProduct,
	updateProduct,
	deleteProduct,
	updateCategories,
	deleteImages,
};
