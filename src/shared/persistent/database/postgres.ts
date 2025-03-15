import knex from 'knex';
import { getLogger } from '../../common/logger';
import { Config } from '../../common/config/config';

const logger = getLogger();
const cfg = Config.instance.config;

class Postgres {
	private static _instance: knex.Knex | undefined;

	static get instance(): knex.Knex {
		if (!this._instance) {
			throw new Error('Tried to access postgres before initializing.');
		}
		return this._instance;
	}

	static init(): void {
		this._instance = knex({
			client: 'pg',
			connection: {
				host: cfg.postgres.host,
				user: cfg.postgres.user,
				password: cfg.postgres.password,
				database: cfg.postgres.name,
			},
			pool: {
				min: 0,
				max: 7,
			},
			log: {
				warn(message) {
					logger.warn(message);
				},
				error(message) {
					logger.error(message);
				},
				debug(message) {
					logger.debug(message);
				},
			},
		});
	}
}

export { Postgres };
