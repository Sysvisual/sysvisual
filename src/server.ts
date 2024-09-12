import http from 'http';

import app from "./app";

(async () => {
  const SERVER_HOST: string = process.env.HOST ?? 'localhost';
  const SERVER_PORT: number = Number(process.env.PORT ?? '8080');

  const appServer = http.createServer(await app());

  appServer.listen(SERVER_PORT, SERVER_HOST === 'localhost' ? undefined : SERVER_HOST, () => {
    console.log(`App server is running on http://${SERVER_HOST}:${SERVER_PORT}`);
  });
})();