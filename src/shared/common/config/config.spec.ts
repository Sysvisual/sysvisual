import { Config } from './config';
import * as fs from 'node:fs';

// Mock fs module
jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

describe('Config', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks and env before each test
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    // Reset Config instance
    // @ts-expect-error - Accessing private property for testing
    Config.instance._config = undefined;
  });

  afterAll(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should be a singleton', () => {
    expect(Config.instance).toBe(Config.instance);
  });

  it('should throw error when accessing config before initialization', () => {
    expect(() => Config.instance.config).toThrow(
      'Tried to access configuration before initializing.'
    );
  });

  it('should initialize config from environment variables', () => {
    // Setup environment variables
    process.env = {
      MONGODB_HOST: 'mongodb-host',
      MONGODB_PORT: '27017',
      MONGODB_NAME: 'test-db',
      MONGODB_USERNAME: 'user',
      MONGODB_PASSWORD_FILE: '/path/to/mongodb-password',

      POSTGRES_HOST: 'postgres-host',
      POSTGRES_USER: 'postgres-user',
      POSTGRES_PORT: '5432',
      POSTGRES_NAME: 'postgres-db',
      POSTGRES_PASSWORD_FILE: '/path/to/postgres-password',

      LOKI_HOST: 'loki-host',
      LOKI_PORT: '3100',

      PORT: '3000',
      ALLOWED_HOSTS: 'localhost,example.com',
      FILE_UPLOAD_DEST: '/uploads',
      JWT_SECRET_FILE: '/path/to/jwt-secret',
      ENVIRONMENT: 'test'
    };

    // Mock file existence and content
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === '/path/to/mongodb-password') return Buffer.from('mongodb-password');
      if (path === '/path/to/postgres-password') return Buffer.from('postgres-password');
      if (path === '/path/to/jwt-secret') return Buffer.from('jwt-secret');
      return Buffer.from('');
    });

    // Initialize config
    Config.instance.init();

    // Verify config values
    const config = Config.instance.config;
    expect(config.mongodb.host).toBe('mongodb-host');
    expect(config.mongodb.port).toBe('27017');
    expect(config.mongodb.name).toBe('test-db');
    expect(config.mongodb.username).toBe('user');
    expect(config.mongodb.password).toBe('mongodb-password');

    expect(config.postgres.host).toBe('postgres-host');
    expect(config.postgres.user).toBe('postgres-user');
    expect(config.postgres.port).toBe('5432');
    expect(config.postgres.name).toBe('postgres-db');
    expect(config.postgres.password).toBe('postgres-password');

    expect(config.loki.host).toBe('loki-host');
    expect(config.loki.port).toBe('3100');

    expect(config.port).toBe('3000');
    expect(config.allowedHosts).toEqual(['localhost', 'example.com']);
    expect(config.fileUploadDest).toBe('/uploads');
    expect(config.jwtSecret).toBe('jwt-secret');
    expect(config.environment).toBe('test');

    // Verify fs calls
    expect(fs.existsSync).toHaveBeenCalledWith('/path/to/mongodb-password');
    expect(fs.existsSync).toHaveBeenCalledWith('/path/to/postgres-password');
    expect(fs.existsSync).toHaveBeenCalledWith('/path/to/jwt-secret');
    expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/mongodb-password');
    expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/postgres-password');
    expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/jwt-secret');
  });

  it('should throw error when required environment variable is missing', () => {
    // Setup environment with missing variable
    process.env = {
      // Missing MONGODB_HOST
      MONGODB_PORT: '27017',
      MONGODB_NAME: 'test-db',
      MONGODB_USERNAME: 'user',
      MONGODB_PASSWORD_FILE: '/path/to/mongodb-password',

      POSTGRES_HOST: 'postgres-host',
      POSTGRES_USER: 'postgres-user',
      POSTGRES_PORT: '5432',
      POSTGRES_NAME: 'postgres-db',
      POSTGRES_PASSWORD_FILE: '/path/to/postgres-password',

      LOKI_HOST: 'loki-host',
      LOKI_PORT: '3100',

      PORT: '3000',
      ALLOWED_HOSTS: 'localhost,example.com',
      FILE_UPLOAD_DEST: '/uploads',
      JWT_SECRET_FILE: '/path/to/jwt-secret',
      ENVIRONMENT: 'test'
    };

    // Expect initialization to throw
    expect(() => Config.instance.init()).toThrow(
      "Could not get required value for: 'MONGODB_HOST'."
    );
  });

  it('should throw error when required file does not exist', () => {
    // Setup environment variables
    process.env = {
      MONGODB_HOST: 'mongodb-host',
      MONGODB_PORT: '27017',
      MONGODB_NAME: 'test-db',
      MONGODB_USERNAME: 'user',
      MONGODB_PASSWORD_FILE: '/path/to/mongodb-password',

      POSTGRES_HOST: 'postgres-host',
      POSTGRES_USER: 'postgres-user',
      POSTGRES_PORT: '5432',
      POSTGRES_NAME: 'postgres-db',
      POSTGRES_PASSWORD_FILE: '/path/to/postgres-password',

      LOKI_HOST: 'loki-host',
      LOKI_PORT: '3100',

      PORT: '3000',
      ALLOWED_HOSTS: 'localhost,example.com',
      FILE_UPLOAD_DEST: '/uploads',
      JWT_SECRET_FILE: '/path/to/jwt-secret',
      ENVIRONMENT: 'test'
    };

    // Mock file existence
    (fs.existsSync as jest.Mock).mockImplementation((path) => {
      if (path === '/path/to/jwt-secret') return false;
      return true;
    });

    // Expect initialization to throw
    expect(() => Config.instance.init()).toThrow(
      "File does not exist: '/path/to/jwt-secret'."
    );
  });

  it('should throw error when file is empty', () => {
    // Setup environment variables
    process.env = {
      MONGODB_HOST: 'mongodb-host',
      MONGODB_PORT: '27017',
      MONGODB_NAME: 'test-db',
      MONGODB_USERNAME: 'user',
      MONGODB_PASSWORD_FILE: '/path/to/mongodb-password',

      POSTGRES_HOST: 'postgres-host',
      POSTGRES_USER: 'postgres-user',
      POSTGRES_PORT: '5432',
      POSTGRES_NAME: 'postgres-db',
      POSTGRES_PASSWORD_FILE: '/path/to/postgres-password',

      LOKI_HOST: 'loki-host',
      LOKI_PORT: '3100',

      PORT: '3000',
      ALLOWED_HOSTS: 'localhost,example.com',
      FILE_UPLOAD_DEST: '/uploads',
      JWT_SECRET_FILE: '/path/to/jwt-secret',
      ENVIRONMENT: 'test'
    };

    // Mock file existence and content
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === '/path/to/jwt-secret') return Buffer.from('');
      return Buffer.from('content');
    });

    // Expect initialization to throw
    expect(() => Config.instance.init()).toThrow(
      "Could not read required value from file for: '/path/to/jwt-secret'."
    );
  });
});
