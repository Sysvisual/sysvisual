import { Router } from 'express';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { mapProductToDTO, WithId } from '../persistence/objectMapper';
import { checkNoEmptyBody } from '../middleware/checkNoEmptyBody';
import { checkAuth } from '../shared/auth/jwt';
import { Logger } from '../shared/common/logging/logger';
import { PopulatedProduct } from '../persistence/database/interface/Product';
import {
	createProduct,
	deleteProduct,
	getProducts,
	getProduct,
	updateProduct,
} from '../persistence/database/repository/ProductRepository';
import { getSite } from '../shared/common/helpers/requestUtils';

const router = Router();
const logger = Logger.instance.getLogger();

router.get('/', async (req, res) => {
	try {
		let showHidden = Boolean(req.query.showHidden ?? false);
		const site = getSite(req)._id.toString();

		if (showHidden && !checkAuth(req)) {
			showHidden = false;
		}

		const products = await getProducts(site, showHidden);

		if (products.isError) {
			return res.sendStatus(500);
		}

		const result = products.value?.map((p) =>
			mapProductToDTO(p as unknown as WithId<PopulatedProduct>)
		);

		return res.status(200).json(result ?? []);
	} catch (_: unknown) {
		res.sendStatus(500);
	}
});

router.get('/:product_id', async (req, res) => {
	const showHidden = Boolean(req.query.showHidden ?? false);
	const site = getSite(req)._id.toString();

	if (showHidden && !checkAuth(req)) {
		res.sendStatus(404);
	}

	try {
		const result = await getProduct(site, req.params.product_id, showHidden);

		if (result.isError) {
			return res.sendStatus(500);
		}

		if (!result.value) {
			return res.sendStatus(404);
		}

		return res
			.status(200)
			.json(
				mapProductToDTO(result.value as unknown as WithId<PopulatedProduct>)
			);
	} catch (_) {
		res.sendStatus(500);
	}
});

router.delete('/:product_id', checkTokenMiddleware, async (req, res) => {
	const productId = req.params.product_id;
	const site = getSite(req)._id.toString();

	if (!productId) {
		res.sendStatus(400);
	}

	const result = await deleteProduct(site, productId);

	if (result.isError) {
		return res.sendStatus(500);
	}

	if (!result.value) {
		return res.sendStatus(404);
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
		const site = getSite(req)._id.toString();

		if (
			productId === undefined ||
			title === undefined ||
			description === undefined ||
			price === undefined ||
			hidden === undefined ||
			site === undefined
		) {
			return res.sendStatus(400);
		}

		try {
			const result = await updateProduct(site, {
				_id: productId,
				title,
				description,
				price,
				images,
				hidden,
			});
			if (result.isError) {
				return res.sendStatus(500);
			}

			if (!result.value) {
				res.sendStatus(404);
			}

			res.sendStatus(200);
		} catch (error) {
			logger.error('Could edit the product', { error });
			res.sendStatus(500);
		}
	}
);

router.post('/', checkTokenMiddleware, checkNoEmptyBody, async (req, res) => {
	try {
		const title = req.body.title;
		const description = req.body.description;
		const price = req.body.price;
		const hidden = req.body.hidden;
		const images = req.body.images ?? [];
		const site = getSite(req)._id.toString();

		if (
			title === undefined ||
			description === undefined ||
			price === undefined ||
			hidden === undefined ||
			site === undefined
		) {
			return res.sendStatus(400);
		}

		await createProduct({
			title,
			description,
			price,
			images,
			hidden,
			categories: [],
			site: site.toString(),
		});

		res.sendStatus(201);
	} catch (error) {
		logger.error('Could not create product', { error });
		res.sendStatus(500);
	}
});

export default router;
