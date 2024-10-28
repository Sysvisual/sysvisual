import { Address, AddressDTO } from './Address';
import { WithId } from '../../objectMapper';

interface ContactDetails {
	email: string;
	firstname: string;
	surname: string;
	addresses: Array<string>;
}

interface PopulatedContactDetails {
	email: string;
	firstname: string;
	surname: string;
	addresses: Array<WithId<Address>>;
}

interface ContactDetailsDTO {
	id: string;
	email: string;
	firstname: string;
	surname: string;
	addresses: AddressDTO[];
}

export { ContactDetails, PopulatedContactDetails, ContactDetailsDTO };
