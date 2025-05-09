import * as fs from 'node:fs';
import { DeepPartial } from '../helpers/typeHelpers';

type ConfigValues = {
	mongodb: {
		host: string;
		port: number;
		name: string;
		username: string;
		password: string;
	};

	postgres: {
		host: string;
		port: number;
		name: string;
		user: string;
		password: string;
	};

	loki: {
		host: string;
		port: number;
	};

	port: number;
	allowedHosts: string[];
	fileUploadDest: string;
	jwtSecret: string;
	environment: string;
};

class MockConfig {
	private readonly config: DeepPartial<ConfigValues>;

	constructor(config: DeepPartial<ConfigValues>) {
		this.config = config;
	}
}

class Config {
	static readonly instance: Config = new Config();
	private _config: ConfigValues | undefined;

	public init(): void {
		this._config = {
			mongodb: {
				host: this.getRequiredValue('MONGODB_HOST'),
				port: this.getRequiredValue('MONGODB_PORT'),
				name: this.getRequiredValue('MONGODB_NAME'),
				username: this.getRequiredValue('MONGODB_USERNAME'),
				password: this.getRequiredStringWithOptionalFile('MONGODB_PASSWORD'),
			},
			postgres: {
				host: this.getRequiredValue('POSTGRES_HOST'),
				user: this.getRequiredValue('POSTGRES_USER'),
				port: this.getRequiredValue('POSTGRES_PORT'),
				name: this.getRequiredValue('POSTGRES_NAME'),
				password: this.getRequiredStringWithOptionalFile('POSTGRES_PASSWORD'),
			},
			loki: {
				host: this.getRequiredValue('LOKI_HOST'),
				port: this.getRequiredValue('LOKI_PORT'),
			},
			port: this.getRequiredValue('PORT'),
			allowedHosts: this.getRequiredValueAsList('ALLOWED_HOSTS'),
			fileUploadDest: this.getRequiredValue('FILE_UPLOAD_DEST'),
			jwtSecret: this.getRequiredStringWithOptionalFile('JWT_SECRET'),
			environment: this.getRequiredValue('ENVIRONMENT'),
		};
	}

	public get config(): ConfigValues {
		if (!this._config) {
			throw new Error('Tried to access configuration before initializing.');
		}
		return this._config;
	}

	private getOptionalValue<T>(path: string): T | undefined {
		const value = process.env[path];
		return value === undefined ? undefined : (value as T);
	}

	private getRequiredValue<T>(path: string): T {
		const value = process.env[path];

		if (!value) {
			throw new Error(`Could not get required value for: '${path}'.`);
		}

		return value as T;
	}

	private getRequiredValueAsList<T>(path: string): T[] {
		const value = process.env[path];

		if (!value) {
			throw new Error(`Could not get required value for: '${path}'.`);
		}

		return value.split(',') as T[];
	}

	private getRequiredStringWithOptionalFile(path: string): string {
		const value = this.getOptionalValue<string>(path);

		if (value === undefined) {
			const valueFile = this.getOptionalValueFromFile(`${path}_FILE`);

			if (!valueFile) {
				throw new Error(`Could not get required value for: '${path}'.`);
			}

			return valueFile;
		}
		return value;
	}

	private getOptionalValueFromFile(path: string): string | undefined {
		const filePath = process.env[path];

		if (!filePath) {
			return undefined;
		}

		if (!fs.existsSync(filePath)) {
			return undefined;
		}

		const fileBuffer = fs.readFileSync(filePath);

		if (!fileBuffer || fileBuffer.length <= 0) {
			return undefined;
		}

		return fileBuffer.toString();
	}

	private getRequiredValueFromFile(path: string): string {
		const filePath = process.env[path];

		if (!filePath) {
			throw new Error(`Could not get filePath for required file: '${path}'.`);
		}

		if (!fs.existsSync(filePath)) {
			throw new Error(`File does not exist: '${filePath}'.`);
		}

		const fileBuffer = fs.readFileSync(filePath);

		if (!fileBuffer || fileBuffer.length <= 0) {
			throw new Error(
				`Could not read required value from file for: '${filePath}'.`
			);
		}

		return fileBuffer.toString();
	}
}

export { Config, MockConfig };
