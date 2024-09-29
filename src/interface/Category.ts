import { ProductDTO } from './Product';

interface Category {
	name: string;
	description: string;
	items: Array<string>;
}

interface CategoryDTO {
	id: string;
	name: string;
	description: string;
	items: Array<ProductDTO>;
	amountItems: number;
}

export { Category, CategoryDTO };
