import winston from 'winston';

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

export const getLogger = () =>
	winston.createLogger({
		transports: [new winston.transports.Console()],
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.json()
		),
		defaultMeta: {
			service: 'sysvisual-backend',
		},
	});

export const ALPHANUMERIC =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
