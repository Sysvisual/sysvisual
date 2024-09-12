import { Router, Express } from 'express';
import ProductModel from '../models/productModel';
import productModel from '../models/productModel';
import fileUpload from '../middleware/fileUpload';
import { checkTokenMiddleware } from '../middleware/checkToken';

const router = Router();

router.get('/products', async (req, res) => {
	try {
		const result = await ProductModel.find()
			.select(['_id', 'title', 'description', 'price', 'image'])
			.exec();

		console.log(result);

		return res.status(200).json(result);
	} catch (err) {
		res.sendStatus(500);
	}
});

router.get('/product/:product_id', async (req, res) => {
	try {
		const result = await ProductModel.find({ _id: req.params.product_id })
			.select(['-_id', 'title', 'description', 'price', 'image'])
			.exec();

		console.log(result);

		if (!result) {
			return res.sendStatus(404);
		}

		return res.status(200).json(result);
	} catch (err) {
		res.sendStatus(500);
	}
});

router.get('/product/image/', )

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
		const imageFiles = req.files;

		if (
			title === undefined ||
			description === undefined ||
			price === undefined
		) {
			return res.sendStatus(400);
		}

		try {
			const imageFileNames: string[] | undefined = new Array<string>()

			if (imageFiles) {
				if (imageFiles instanceof Array) {
					for (let file of imageFiles) {
						imageFileNames.push(file.filename);
					}
				} else {
					for (let directory in imageFiles) {
						for(let file of imageFiles[directory]) {
							imageFileNames.push(`${directory}/${file}`);
						}
					}
				}
			}

			await productModel.create({
				title,
				description,
				price,
				imageFileNames,
			});


			res.sendStatus(201);
		} catch (err) {
			res.sendStatus(500);
		}
	}
);

export default router;
