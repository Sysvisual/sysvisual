export interface Product {
	title: string;
	description: string;
	images: Array<string>;
	price: number;
	categories: Array<string>;
}

export interface ProductDTO {
	id: string;
	title: string;
	description: string;
	images: Array<string>;
	price: number;
	categories: Array<string>;
}
