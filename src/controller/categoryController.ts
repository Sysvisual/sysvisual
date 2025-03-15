import { Router } from 'express';
import { mapCategoryToDTO, WithId } from '../shared/persistent/objectMapper';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { checkNoEmptyBody } from '../middleware/checkNoEmptyBody';
import {
	Category,
	PopulatedCategory,
} from '../shared/persistent/database/interface/Category';
import { Product } from '../shared/persistent/database/interface/Product';
import { checkAuth } from '../shared/auth/jwt';
import {
	createCategory,
	deleteCategory,
	getCategories,
	getCategory,
	updateCategory,
} from '../shared/persistent/database/repository/CategoryRepository';
import { updateCategories } from '../shared/persistent/database/repository/ProductRepository';
import { getSite } from '../shared/common/helpers/requestUtils';

const router = Router();

router.get('/', async (req, res) => {
	try {
		let showHiddenProducts = Boolean(req.query.showHiddenProducts ?? false);

		if (showHiddenProducts && !checkAuth(req)) {
			showHiddenProducts = false;
		}

		const site = getSite(req)._id.toString();
		const categories = await getCategories(site, showHiddenProducts);

		if (categories.isError) {
			return res.sendStatus(500);
		}

		const mappedResult = categories.value?.map((category) =>
			mapCategoryToDTO(
				category as unknown as WithId<Category> & { items: Product[] }
			)
		);
		return res.status(200).json(mappedResult ?? []);
	} catch (_: unknown) {
		res.sendStatus(500);
	}
});

router.get('/:category_id', async (req, res) => {
	try {
		let showHiddenProducts = Boolean(req.query.showHiddenProducts ?? false);

		if (showHiddenProducts && !checkAuth(req)) {
			showHiddenProducts = false;
		}
		const site = getSite(req)._id.toString();
		const category = await getCategory(
			site,
			req.params.category_id,
			showHiddenProducts
		);

		if (category.isError) {
			return res.sendStatus(500);
		}

		if (!category.value) {
			return res.sendStatus(404);
		}

		res
			.status(200)
			.json(mapCategoryToDTO(category as unknown as WithId<PopulatedCategory>));
	} catch (_) {
		res.sendStatus(500);
	}
});

router.delete('/:category_id', checkTokenMiddleware, async (req, res) => {
	try {
		const categoryId = req.params.category_id;
		const site = getSite(req)._id.toString();

		if (!categoryId) {
			return res.sendStatus(400);
		}

		const category = await deleteCategory(site, categoryId);

		if (category.isError) {
			return res.sendStatus(500);
		}

		res.sendStatus(200);
	} catch (_) {
		res.sendStatus(500);
	}
});

router.put(
	'/:category_id',
	checkTokenMiddleware,
	checkNoEmptyBody,
	async (req, res) => {
		try {
			const categoryId = req.params.category_id;
			const name = req.body.name as string;
			const description = req.body.description as string;
			const items: string[] = req.body.items ?? [];

			const site = getSite(req)._id.toString();

			if (name === undefined || description === undefined) {
				return res.sendStatus(400);
			}

			await updateCategory(site, {
				_id: categoryId,
				name,
				description,
				items,
			});

			void updateCategories(site, categoryId, items);

			res.sendStatus(201);
		} catch (_) {
			res.sendStatus(500);
		}
	}
);

router.post('/', checkTokenMiddleware, checkNoEmptyBody, async (req, res) => {
	try {
		const name = req.body.name;
		const description = req.body.description;
		const items: Array<string> = req.body.items ?? [];

		const site = getSite(req)._id.toString();

		if (name === undefined || description === undefined) {
			return res.sendStatus(400);
		}

		const category = await createCategory(site, {
			name,
			description,
			items,
		});

		if (category.isError || !category.value) {
			return res.sendStatus(500);
		}

		void updateCategories(site, category.value, items);

		res.sendStatus(201);
	} catch (_) {
		res.sendStatus(500);
	}
});

export default router;
