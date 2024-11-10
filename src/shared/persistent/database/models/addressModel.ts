import { model, Schema } from 'mongoose';
import { Address } from '../interface/Address';

const Types = Schema.Types;

const addressSchema = new Schema<Address>({
	street: {
		type: Types.String,
		required: true,
	},
	house_number: {
		type: Types.String,
		required: true,
	},
	city: {
		type: Types.String,
		required: true,
	},
	country: {
		type: Types.String,
		required: true,
	},
	zip: {
		type: Types.String,
		required: true,
	},
	state: {
		type: Types.String,
		required: true,
	},
});

export default model('addresses', addressSchema);
