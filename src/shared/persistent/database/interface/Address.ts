interface Address {
	street: string;
	house_number: string;
	city: string;
	state: string;
	country: string;
	zip: string;
}

interface AddressDTO {
	id: string;
	street: string;
	house_number: string;
	city: string;
	state: string;
	country: string;
	zip: string;
}

export { Address, AddressDTO };
