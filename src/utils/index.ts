export const generateAlphanumericStr = (length: number = 12): string => {
	if (length < 1) {
		throw new Error('Password length can not be shorter than 1 character!');
	}

	const possibleCharacters = ALPHANUMERIC.length;
	let result = '';
	for (let i = 0; i < length; i++) {
		result += ALPHANUMERIC.charAt(Math.random() * possibleCharacters);
	}

	return result;
};

export const ALPHANUMERIC =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
