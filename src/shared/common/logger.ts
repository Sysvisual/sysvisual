import winston from 'winston';

const getLogger = () =>
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

export { getLogger };
