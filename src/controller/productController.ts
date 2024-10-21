import { Router } from 'express';
import ProductModel from '../models/productModel';
import productModel from '../models/productModel';
import fileUpload from '../middleware/fileUpload';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { mapProductToDTO } from '../utils/objectMapper';
import { checkNoEmptyBody } from '../middleware/checkNoEmptyBody';
import fs from 'fs';
import CategoryModel from '../models/categoryModel';

const router = Router();

router.get('/', async (_, res) => {
	try {
		const result = await ProductModel.find()
			.select(['_id', 'title', 'description', 'price', 'images', 'categories'])
			.exec();

		return res
			.status(200)
			.json(result.map((product) => mapProductToDTO(product)));
	} catch (_: unknown) {
		res.sendStatus(500);
	}
});

router.get('/:product_id', async (req, res) => {
	try {
		const result = await ProductModel.findOne({ _id: req.params.product_id })
			.select(['_id', 'title', 'description', 'price', 'images', 'categories'])
			.exec();

		if (!result) {
			return res.sendStatus(404);
		}

		return res.status(200).json(mapProductToDTO(result));
	} catch (_) {
		res.sendStatus(500);
	}
});

router.get('/image/:imageName/', async (req, res) => {
	const IMAGE_BASE_PATH = process.env.FILE_UPLOAD_DEST ?? '/upload';
	const imageName = req.params.imageName;

	if (!fs.existsSync(`${IMAGE_BASE_PATH}${imageName}`)) {
		return res.sendStatus(404);
	}

	res.sendFile(imageName, { root: IMAGE_BASE_PATH });
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

	if (product.images.length > 0) {
		try {
			const dir = product.images[0].split(/\//)[0];
			fs.rmSync(`${process.env.FILE_UPLOAD_DEST}/${dir}`, {
				force: true,
				recursive: true,
			});
		} catch (_) {
			res.sendStatus(500);
		}
	}

	if (product.categories.length > 0) {
		CategoryModel.updateMany(
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

router.post(
	'/:productId',
	checkTokenMiddleware,
	checkNoEmptyBody,
	async (req, res) => {
		const productId = req.params.productId;
		const title = req.body.title;
		const description = req.body.description;
		const price = req.body.price;

		if (
			productId === undefined ||
			title === undefined ||
			description === undefined ||
			price === undefined
		) {
			return res.sendStatus(400);
		}

		try {
			await productModel.findOneAndUpdate(
				{ _id: productId },
				{
					title,
					description,
					price: (price * 100).toFixed(2),
				},
				{ new: true }
			);
			res.sendStatus(200);
		} catch (_) {
			res.sendStatus(500);
		}
	}
);

router.post(
	'/',
	checkTokenMiddleware,
	checkNoEmptyBody,
	fileUpload.array('images'),
	async (req, res) => {
		const title = req.body.title;
		const description = req.body.description;
		const price = req.body.price;
		const imageFiles = req.files;

		if (
			title === undefined ||
			description === undefined ||
			price === undefined
		) {
			return res.sendStatus(400);
		}

		try {
			const imageFileNames: Array<string> | undefined = new Array<string>();

			if (imageFiles) {
				if (imageFiles instanceof Array) {
					for (const file of imageFiles) {
						imageFileNames.push(file.filename);
					}
				} else {
					for (const directory in imageFiles) {
						for (const file of imageFiles[directory]) {
							imageFileNames.push(`${directory}/${file}`);
						}
					}
				}
			}

			const transformedFileNames: Array<string> = imageFileNames.map(
				(fileName) => `${req.headers['X-RandomUUID']}/${fileName}`
			);

			await productModel.create({
				title,
				description,
				price: (price * 100).toFixed(2),
				images: transformedFileNames,
			});

			res.sendStatus(201);
		} catch (_) {
			res.sendStatus(500);
		}
	}
);

export default router;
