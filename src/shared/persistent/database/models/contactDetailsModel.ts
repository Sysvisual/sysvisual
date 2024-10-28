import { model, Schema } from 'mongoose';
import { ContactDetails } from '../interface/ContactDetails';

const Types = Schema.Types;

const contactDetailsSchema = new Schema<ContactDetails>({
	email: {
		type: Types.String,
		validate:
			/^\b[a-zA-Z0-9._+]{1,64}@[a-zA-Z0-9.\-_]{1,254}\.[a-zA-Z0-9]{1,63}$/,
		required: true,
		unique: true,
	},
	firstname: {
		type: Types.String,
		required: true,
	},
	surname: {
		type: Types.String,
		required: true,
	},
	addresses: {
		type: [Types.String],
		required: true,
		ref: 'addresses',
	},
});

export default model('contactDetails', contactDetailsSchema);
