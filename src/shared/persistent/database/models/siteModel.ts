import { model, Schema } from 'mongoose';
import { Site } from '../interface/Site';

const Types = Schema.Types;

const siteSchema = new Schema<Site>({
	name: {
		type: Types.String,
		minlength: 1,
		required: true,
	},
	owner: {
		type: Types.String,
		required: true,
		ref: 'users',
	},
	domains: {
		type: [Types.String],
		default: [],
	},
});

export default model('sites', siteSchema);
