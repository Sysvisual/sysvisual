import { Address } from '../interface/Address';
import { ErrorResult, resultFromError } from '../../../common/result';
import { AddressModel } from '../models';

const createAddress = async (
	address: Address
): Promise<ErrorResult<string>> => {
	try {
		const addressDocument = await AddressModel.create({
			street: address.street,
			house_number: address.house_number,
			city: address.city,
			state: address.state,
			country: address.country,
			zip: address.zip,
		});

		return new ErrorResult(addressDocument._id.toString(), null);
	} catch (error) {
		return resultFromError(error);
	}
};

export { createAddress };
