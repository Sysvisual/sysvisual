export interface Product {
	title: string;
	hidden: boolean;
	description: string;
	images: Array<string>;
	price: number;
	categories: Array<string>;
}

export interface ProductDTO {
	id: string;
	hidden?: boolean;
	title: string;
	description: string;
	images: Array<string>;
	price: number;
	categories: Array<string>;
}
