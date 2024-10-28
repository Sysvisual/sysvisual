import { PopulatedSite } from './Site';

export interface Product {
	title: string;
	hidden: boolean;
	description: string;
	images: Array<string>;
	price: number;
	categories: Array<string>;
	site: string;
}

export interface PopulatedProduct {
	title: string;
	hidden: boolean;
	description: string;
	images: Array<string>;
	price: number;
	categories: Array<string>;
	site: PopulatedSite;
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
