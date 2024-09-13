import { Product, ProductDTO } from '../interface/Product';
import { Types } from 'mongoose';

const mapProductToDTO = (product: (Product & { _id: Types.ObjectId })): ProductDTO => {
	if(product._id === undefined) {
		throw new Error("Id of product can not be undefined");
	}

	return {
		id: product._id.toString(),
		title: product.title,
		description: product.description,
		price: product.price,
		images: product.images,
	}
}

export {
	mapProductToDTO,
}