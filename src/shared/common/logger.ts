import winston from 'winston';
import LokiTransport from 'winston-loki';
import { Config } from './config/config';

const getLogger = () =>
	winston.createLogger({
		transports: [
			new winston.transports.Console(),
			new LokiTransport({
				host: Config.instance.config.loki.host,
				json: true,
				labels: { service: 'sysvisual-backend' },
				interval: 100,
			}),
		],
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.json()
		),
		defaultMeta: {
			service: 'sysvisual-backend',
		},
	});

export { getLogger };
