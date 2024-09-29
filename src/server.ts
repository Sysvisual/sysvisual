import http from 'http';

import app from './app';

(async () => {
	const SERVER_PORT: number = Number(process.env.PORT ?? '8080');

	const appServer = http.createServer(await app());

	appServer.listen(SERVER_PORT, () => {
		console.log(`App server is running on port ${SERVER_PORT}!`);
	});
})();
