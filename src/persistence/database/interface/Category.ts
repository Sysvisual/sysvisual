import { Product, ProductDTO } from './Product';

interface Category {
	name: string;
	description: string;
	items: Array<string>;
	site: string;
}

interface PopulatedCategory {
	name: string;
	description: string;
	items: Array<Product>;
}

interface CategoryDTO {
	id: string;
	name: string;
	description: string;
	items: Array<ProductDTO>;
	amountItems: number;
}

export { Category, PopulatedCategory, CategoryDTO };
