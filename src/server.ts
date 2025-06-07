import { Config } from './shared/common/config/config';
// Has to load config before starting anything
Config.instance.init();

import { Logger } from './shared/common/logging/logger';
import http from 'http';
import app from './app';
import mongoose from 'mongoose';

const logger = Logger.instance.getLogger();

(async () => {
	const SERVER_PORT: number = Number(Config.instance.config.port ?? '8080');

	const appServer = http.createServer(await app());

	appServer.listen(SERVER_PORT);
})();

process.addListener('SIGINT', () => {
	mongoose.connections.map((con) => con.close());
	logger.info('App server is stopping.');
});
