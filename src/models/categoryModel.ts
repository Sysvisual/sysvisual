import mongoose from 'mongoose';
import { Category } from '../interface/Category';

const Types = mongoose.Schema.Types;

const categorySchema = new mongoose.Schema<Category>({
	name: {
		type: Types.String,
		required: true,
	},
	description: {
		type: Types.String,
		required: true,
	},
	items: {
		type: [Types.String],
		required: true,
		ref: 'products',
	},
});

categorySchema.pre('save', function (next) {
	for (const item of this.items) {
		if (!mongoose.isValidObjectId(item)) {
			return;
		}
	}

	next();
});

export default mongoose.model('categories', categorySchema);
