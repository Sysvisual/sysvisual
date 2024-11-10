import { PopulatedUser, UserDTO } from './User';
import { WithId } from '../../objectMapper';

interface Site {
	name: string;
	domains: string[];
	owner: string;
}

interface PopulatedSite {
	name: string;
	domains: string[];
	owner: WithId<PopulatedUser>;
}

interface SiteDTO {
	id: string;
	name: string;
	domains: string[];
	owner: UserDTO;
}

export { Site, SiteDTO, PopulatedSite };
