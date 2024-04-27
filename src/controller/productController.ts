import { Router } from 'express';
import ProductModel from '../models/productModel';
import productModel from '../models/productModel';
import fileUpload from '../middleware/fileUpload';
import { checkTokenMiddleware } from '../middleware/checkToken';

const router = Router();

router.get('/products', async (req, res) => {
	try {
		const result = await ProductModel.find({})
			.select(['-_id', 'title', 'description', 'price', 'image'])
			.exec();

		return res.status(200).json(result);
	} catch (err) {
		res.sendStatus(500);
	}
});

router.post(
	'/product',
	fileUpload.single('image'),
	checkTokenMiddleware,
	async (req, res) => {
		if (!req.body) {
			console.error('No body')
			return res.sendStatus(400);
		}

		const title = req.body.title;
		const description = req.body.description;
		const price = req.body.price;
		const imageFile = req.file;

		if (
			title === undefined ||
			description === undefined ||
			price === undefined ||
			imageFile === undefined
		) {
			return res.sendStatus(400);
		}

		try {
			const image = `http://${process.env.HOST}/assets/${imageFile.filename}`;

			await productModel.create({
				title,
				description,
				price,
				image,
			});

			res.sendStatus(201);
		} catch (err) {
			res.sendStatus(500);
		}
	}
);

export default router;
