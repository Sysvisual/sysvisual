import { Router } from 'express';
import ProductModel from '../models/productModel';
import productModel from '../models/productModel';
import { checkToken } from './userController';

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
	(req, res, next) => {
		const token = req.cookies['token'];

		if (undefined === token || !checkToken(token)) {
			return res.sendStatus(401);
		}

		next();
	},
	async (req, res) => {
		if (!req.body) {
			return res.sendStatus(400);
		}

		const title = req.body.title;
		const description = req.body.description;
		const price = req.body.price;
		const image = req.body.image;

		if (
			title === undefined ||
			description === undefined ||
			price === undefined ||
			image === undefined
		) {
			return res.sendStatus(400);
		}

		try {
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
