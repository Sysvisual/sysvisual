import { Product, ProductDTO } from '../interface/Product';
import { Types } from 'mongoose';
import { Category, CategoryDTO } from '../interface/Category';

type WithId<T> = T & { _id: Types.ObjectId };

const mapProductToDTO = (product: WithId<Product>): ProductDTO => {
	if (product._id === undefined) {
		throw new Error('Id of product can not be undefined');
	}

	return {
		id: product._id.toString(),
		title: product.title,
		description: product.description,
		price: product.price,
		images: product.images,
		categories: product.categories,
	};
};

const mapCategoryToDTO = (
	category: WithId<Category> & { items: Product[] }
): CategoryDTO => {
	if (category._id === undefined) {
		throw new Error('ID of category can not be undefined');
	}

	return {
		id: category._id.toString(),
		name: category.name,
		description: category.description,
		// ts-expect-error
		items: (category.items as Product[]).map((p) =>
			mapProductToDTO(p as unknown as WithId<Product>)
		),
		amountItems: category.items.length,
	};
};

export { mapProductToDTO, mapCategoryToDTO, WithId };
