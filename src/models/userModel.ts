import { Schema, model } from 'mongoose';
import { User } from '../interface/User';
import bcrypt from 'bcrypt';

const Types = Schema.Types;

const userModel = new Schema<User>({
	username: {
		type: Types.String,
		required: true,
	},
	password: {
		type: Types.String,
		required: true,
	},
});

userModel.pre('save', function (next) {
	if (this.isModified('password')) {
		bcrypt.genSalt(10, (_, salt) => {
			bcrypt.hash(this.password, salt, (_, hash) => {
				this.password = hash;
				next();
			});
		});
	}
});

export default model('users', userModel);
