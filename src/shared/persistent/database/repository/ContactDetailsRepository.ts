import { ContactDetails } from '../interface/ContactDetails';
import { ErrorResult, Result, resultFromError } from '../../../common/result';
import { ContactDetailsModel } from '../models';

const createContactDetails = async (
	contactDetails: ContactDetails
): Promise<ErrorResult<string>> => {
	try {
		const contactDetailsDocument = await ContactDetailsModel.create({
			email: contactDetails.email,
			firstname: contactDetails.firstname,
			surname: contactDetails.surname,
			addresses: contactDetails.addresses,
		});

		return new Result(contactDetailsDocument._id.toString(), null);
	} catch (error) {
		return resultFromError(error);
	}
};

export { createContactDetails };
