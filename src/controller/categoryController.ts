import { Request, Router } from 'express';
import CategoryModel from '../models/categoryModel';
import { mapCategoryToDTO, WithId } from '../utils/objectMapper';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { checkNoEmptyBody } from '../middleware/checkNoEmptyBody';
import { Category } from '../interface/Category';
import { Product } from '../interface/Product';
import ProductModel from '../models/productModel';
import { verifyJWT } from '../utils/jwt';

const router = Router();

const checkAuth = (req: Request): boolean => {
	const token = req.cookies['token'];

	return !(undefined === token || !verifyJWT(token));
};

router.get('/', async (req, res) => {
	let showHiddenProducts = Boolean(req.query.showHiddenProducts ?? false);

	if (showHiddenProducts && !checkAuth(req)) {
		showHiddenProducts = false;
	}

	try {
		const query = CategoryModel.find().select([
			'_id',
			'name',
			'description',
			'items',
		]);

		if (!showHiddenProducts) {
			query.populate({ path: 'items', match: { hidden: false } });
		} else {
			query.populate('items');
		}

		const result = await query.exec();

		const mappedResult = result.map((category) =>
			mapCategoryToDTO(
				category as unknown as WithId<Category> & { items: Product[] }
			)
		);
		return res.status(200).json(mappedResult);
	} catch (_: unknown) {
		res.sendStatus(500);
	}
});

router.get('/:category_id', async (req, res) => {
	let showHiddenProducts = Boolean(req.query.showHiddenProducts ?? false);

	if (showHiddenProducts && !checkAuth(req)) {
		showHiddenProducts = false;
	}

	try {
		const query = CategoryModel.findOne({ _id: req.params.category_id }).select(
			['_id', 'name', 'description', 'items']
		);

		if (!showHiddenProducts) {
			query.populate({ path: 'items', match: { hidden: false } });
		} else {
			query.populate('items');
		}

		const result = await query.exec();

		if (!result) {
			return res.sendStatus(404);
		}

		res
			.status(200)
			.json(
				mapCategoryToDTO(
					result as unknown as WithId<Category> & { items: Product[] }
				)
			);
	} catch (_) {
		res.sendStatus(500);
	}
});

router.delete('/:category_id', checkTokenMiddleware, async (req, res) => {
	const categoryId = req.params.category_id;

	if (!categoryId) {
		return res.sendStatus(400);
	}

	const category = await CategoryModel.findOneAndDelete({
		_id: req.params.category_id,
	});

	if (!category) {
		return res.sendStatus(404);
	}

	res.sendStatus(200);
});

router.post(
	'/:category_id',
	checkTokenMiddleware,
	checkNoEmptyBody,
	async (req, res) => {
		const name = req.body.name;
		const description = req.body.description;
		const items = req.body.items ?? [];

		if (name === undefined || description === undefined) {
			return res.sendStatus(400);
		}

		try {
			await CategoryModel.findOneAndUpdate(
				{ _id: req.params.category_id },
				{
					name,
					description,
					items,
				},
				{ new: true }
			);

			void updateProducts(req.params.category_id, items);

			res.sendStatus(201);
		} catch (_) {
			res.sendStatus(500);
		}
	}
);

router.post('/', checkTokenMiddleware, checkNoEmptyBody, async (req, res) => {
	const name = req.body.name;
	const description = req.body.description;
	const items: Array<string> = req.body.items ?? [];

	if (name === undefined || description === undefined) {
		return res.sendStatus(400);
	}

	try {
		const category = await CategoryModel.create({
			name,
			description,
			items,
		});

		void updateProducts(category._id.toString(), items);

		res.sendStatus(201);
	} catch (_) {
		res.sendStatus(500);
	}
});

export default router;

const updateProducts = async (categoryId: string, items: string[]) => {
	await ProductModel.updateMany(
		{
			_id: { $nin: items },
		},
		{ $pull: { categories: categoryId } },
		{ new: true }
	);

	await ProductModel.updateMany(
		{
			_id: { $in: items },
		},
		{
			$push: {
				categories: categoryId,
			},
		}
	);
};
