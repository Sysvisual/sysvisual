import { Router, Request } from 'express';
import ProductModel from '../models/productModel';
import productModel from '../models/productModel';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { mapProductToDTO } from '../utils/objectMapper';
import { checkNoEmptyBody } from '../middleware/checkNoEmptyBody';
import fs from 'fs';
import CategoryModel from '../models/categoryModel';
import { verifyJWT } from '../auth/jwt';
import { deleteImages } from '../utils/fileHandler';
import { getLogger } from '../utils';

const router = Router();
const logger = getLogger();

const checkAuth = (req: Request): boolean => {
	const token = req.cookies['token'];

	return !(undefined === token || !verifyJWT(token));
};

router.get('/', async (req, res) => {
	let showHidden = Boolean(req.query.showHidden ?? false);

	if (showHidden && !checkAuth(req)) {
		showHidden = false;
	}

	try {
		const dbResult = await ProductModel.find()
			.select([
				'_id',
				'title',
				'description',
				'price',
				'hidden',
				'images',
				'categories',
			])
			.exec();

		const result = dbResult
			.filter((p) => (showHidden ? true : !p.hidden))
			.map((p) => mapProductToDTO(p));

		return res.status(200).json(result);
	} catch (_: unknown) {
		res.sendStatus(500);
	}
});

router.get('/:product_id', async (req, res) => {
	const showHidden = Boolean(req.query.showHidden ?? false);

	if (showHidden && !checkAuth(req)) {
		res.sendStatus(404);
	}

	try {
		const result = await ProductModel.findOne({ _id: req.params.product_id })
			.select([
				'_id',
				'title',
				'description',
				'price',
				'hidden',
				'images',
				'categories',
			])
			.exec();

		if (!result || (!showHidden && result.hidden)) {
			return res.sendStatus(404);
		}

		return res.status(200).json(mapProductToDTO(result));
	} catch (_) {
		res.sendStatus(500);
	}
});

router.delete('/:product_id', checkTokenMiddleware, async (req, res) => {
	const productId = req.params.product_id;

	if (!productId) {
		res.sendStatus(400);
	}

	const product = await ProductModel.findOneAndDelete({ _id: productId });

	if (!product) {
		return res.sendStatus(404);
	}

	const dirSet = new Set();

	for (const image of product.images) {
		dirSet.add(image.split(/\//)[0]);
	}

	if (product.images.length > 0) {
		try {
			for (const dir of dirSet) {
				fs.rmSync(`${process.env.FILE_UPLOAD_DEST}/${dir}`, {
					force: true,
					recursive: true,
				});
			}
		} catch (_) {
			res.sendStatus(500);
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
	res.sendStatus(200);
});

router.put(
	'/:productId',
	checkTokenMiddleware,
	checkNoEmptyBody,
	async (req, res) => {
		const productId = req.params.productId;
		const title = req.body.title;
		const description = req.body.description;
		const price = req.body.price;
		const images = req.body.images ?? [];
		const hidden = req.body.hidden;

		if (
			productId === undefined ||
			title === undefined ||
			description === undefined ||
			price === undefined ||
			hidden === undefined
		) {
			return res.sendStatus(400);
		}

		try {
			const oldProduct = await productModel.findOneAndUpdate(
				{ _id: productId },
				{
					title,
					description,
					hidden,
					images,
					price: (price * 100).toFixed(2),
				}
			);

			if (!oldProduct) {
				return res.sendStatus(404);
			}

			const removedImages = oldProduct.images.filter(
				(img) => !images.includes(img)
			);
			await deleteImages(removedImages);

			res.sendStatus(200);
		} catch (error) {
			logger.error('Could edit the product', { error });
			res.sendStatus(500);
		}
	}
);

router.post('/', checkTokenMiddleware, checkNoEmptyBody, async (req, res) => {
	const title = req.body.title;
	const description = req.body.description;
	const price = req.body.price;
	const hidden = req.body.hidden;
	const images = req.body.images ?? [];

	if (
		title === undefined ||
		description === undefined ||
		price === undefined ||
		hidden === undefined
	) {
		return res.sendStatus(400);
	}

	try {
		await productModel.create({
			title,
			description,
			hidden,
			price: (price * 100).toFixed(2),
			images,
		});

		res.sendStatus(201);
	} catch (error) {
		logger.error('Could not create product', { error });
		res.sendStatus(500);
	}
});

export default router;
