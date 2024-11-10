import {
	PopulatedProduct,
	Product,
	ProductDTO,
} from './database/interface/Product';
import { Types } from 'mongoose';
import { CategoryDTO, PopulatedCategory } from './database/interface/Category';
import { PopulatedUser, UserDTO } from './database/interface/User';
import {
	ContactDetailsDTO,
	PopulatedContactDetails,
} from './database/interface/ContactDetails';
import { Address, AddressDTO } from './database/interface/Address';
import { PopulatedSite, SiteDTO } from './database/interface/Site';

type WithId<T> = T & { _id: Types.ObjectId | string };
type WithoutId<T> = Omit<T, 'id'>;

const mapProductToDTO = (product: WithId<PopulatedProduct>): ProductDTO => {
	if (product._id === undefined) {
		throw new Error('Id of product can not be undefined');
	}

	return {
		id: product._id.toString(),
		title: product.title,
		description: product.description,
		price: product.price / 100,
		images: product.images,
		hidden: product.hidden,
		categories: product.categories,
	};
};

const mapCategoryToDTO = (category: WithId<PopulatedCategory>): CategoryDTO => {
	if (category._id === undefined) {
		throw new Error('ID of category can not be undefined');
	}

	return {
		id: category._id.toString(),
		name: category.name,
		description: category.description,
		// ts-expect-error
		items: (category.items as Product[]).map((p) =>
			mapProductToDTO(p as unknown as WithId<PopulatedProduct>)
		),
		amountItems: category.items.length,
	};
};

const mapAddressToDTO = (address: WithId<Address>): AddressDTO => {
	if (address._id === undefined) {
		throw new Error('ID of address can not be undefined');
	}

	return {
		id: address._id.toString(),
		street: address.street,
		house_number: address.house_number,
		city: address.city,
		state: address.state,
		country: address.country,
		zip: address.zip,
	};
};

const mapContactDetailsToDTO = (
	details: WithId<PopulatedContactDetails>
): ContactDetailsDTO => {
	if (details._id === undefined) {
		throw new Error('ID of contact details can not be undefined');
	}

	return {
		id: details._id.toString(),
		email: details.email,
		firstname: details.firstname,
		surname: details.surname,
		addresses: details.addresses.map((address) => mapAddressToDTO(address)),
	};
};

const mapUserToDTO = (user: WithId<PopulatedUser>): UserDTO => {
	if (user._id === undefined) {
		throw new Error('User can not be undefined');
	}

	return {
		id: user._id.toString(),
		username: user.username,
		createdAt: user.createdAt,
		contactDetails: mapContactDetailsToDTO(user.contactDetails),
	};
};

const mapSiteToDTO = (site: WithId<PopulatedSite>): SiteDTO => {
	if (site._id === undefined) {
		throw new Error('Site can not be undefined');
	}

	return {
		id: site._id.toString(),
		name: site.name,
		domains: site.domains,
		owner: mapUserToDTO(site.owner),
	};
};

export {
	mapProductToDTO,
	mapCategoryToDTO,
	mapUserToDTO,
	mapContactDetailsToDTO,
	mapAddressToDTO,
	mapSiteToDTO,
	WithId,
	WithoutId,
};
