import http from 'http';
import app from './app';
import { getLogger } from './utils';

const logger = getLogger();

(async () => {
	const SERVER_PORT: number = Number(process.env.PORT ?? '8080');

	const appServer = http.createServer(await app());

	appServer.listen(SERVER_PORT, () => {
		logger.info(`App server is running.`);
	});
})();

process.addListener('SIGINT', () => {
	logger.info('App server is stopping.');
});
