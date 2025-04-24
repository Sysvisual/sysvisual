import { Postgres } from './postgres';
import knex from 'knex';
import { Logger } from '../../common/logger';
import { Config as _Config } from '../../common/config/config';

// Mock dependencies
jest.mock('knex', () => {
  const mockKnex = jest.fn().mockReturnValue('mock-knex-instance');
  return mockKnex;
});

jest.mock('../../common/logger', () => ({
  Logger: {
    instance: {
      getLogger: jest.fn().mockReturnValue({
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
      })
    }
  }
}));

jest.mock('../../common/config/config', () => ({
  Config: {
    instance: {
      config: {
        postgres: {
          host: 'postgres-host',
          user: 'postgres-user',
          password: 'postgres-password',
          name: 'postgres-db'
        }
      }
    }
  }
}));

describe('Postgres', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset Postgres instance
    // @ts-expect-error - Accessing private property for testing
    Postgres._instance = undefined;
  });

  describe('init', () => {
    it('should initialize a Knex instance with correct configuration', () => {
      // Call the function
      Postgres.init();

      // Verify knex was called with correct parameters
      expect(knex).toHaveBeenCalledWith({
        client: 'pg',
        connection: {
          host: 'postgres-host',
          user: 'postgres-user',
          password: 'postgres-password',
          database: 'postgres-db'
        },
        pool: {
          min: 0,
          max: 7
        },
        log: {
          warn: expect.any(Function),
          error: expect.any(Function),
          debug: expect.any(Function)
        }
      });

      // Verify the instance was set
      // @ts-expect-error - Accessing private property for testing
      expect(Postgres._instance).toBe('mock-knex-instance');
    });

    it('should configure logging functions correctly', () => {
      // Call the function
      Postgres.init();

      // Get the log functions from the knex config
      const knexConfig = (knex as unknown as jest.Mock).mock.calls[0][0];
      const { warn, error, debug } = knexConfig.log;

      // Mock logger
      const mockLogger = Logger.instance.getLogger();

      // Call the log functions
      warn('warning message');
      error('error message');
      debug('debug message');

      // Verify logger methods were called
      expect(mockLogger.warn).toHaveBeenCalledWith('warning message');
      expect(mockLogger.error).toHaveBeenCalledWith('error message');
      expect(mockLogger.debug).toHaveBeenCalledWith('debug message');
    });
  });

  describe('instance', () => {
    it('should return the Knex instance after initialization', () => {
      // Initialize
      Postgres.init();

      // Get the instance
      const instance = Postgres.instance;

      // Verify the instance
      expect(instance).toBe('mock-knex-instance');
    });

    it('should throw an error when accessed before initialization', () => {
      // Expect accessing the instance to throw
      expect(() => Postgres.instance).toThrow(
        'Tried to access postgres before initializing.'
      );
    });
  });
});
