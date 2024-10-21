import mongoose from 'mongoose';
import { Product } from '../interface/Product';

const Types = mongoose.Schema.Types;

const productModel = new mongoose.Schema<Product>({
	title: {
		type: Types.String,
		required: true,
	},
	price: {
		type: Types.Number,
		required: true,
	},
	description: {
		type: Types.String,
		required: true,
	},
	images: {
		type: [Types.String],
		required: true,
	},
	categories: {
		type: [Types.String],
		required: true,
		ref: 'categories',
	},
	hidden: {
		type: Types.Boolean,
		default: false,
	},
});

productModel.pre('save', function (next) {
	if (this.price < 0) return next(new mongoose.Error.ValidationError());
	next();
});

export default mongoose.model('products', productModel);
