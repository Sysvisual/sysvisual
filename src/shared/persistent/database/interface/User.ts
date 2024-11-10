import { ContactDetailsDTO, PopulatedContactDetails } from './ContactDetails';
import { WithId } from '../../objectMapper';

interface User {
	username: string;
	password: string;
	contactDetails: string;
	createdAt: number;
}

interface PopulatedUser {
	username: string;
	password: string;
	contactDetails: WithId<PopulatedContactDetails>;
	createdAt: number;
}

interface UserDTO {
	id: string;
	username: string;
	createdAt: number;
	contactDetails: ContactDetailsDTO;
}

export { User, UserDTO, PopulatedUser };
