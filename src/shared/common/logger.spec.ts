import { Logger } from './logger';
import winston from 'winston';
import LokiTransport from 'winston-loki';
import { Config as _Config } from './config/config';

// Mock dependencies
jest.mock('winston', () => {
  const mLogger = {
    createLogger: jest.fn().mockReturnValue({
      /* mock logger methods */
    }),
    format: {
      timestamp: jest.fn().mockReturnValue('timestamp-format'),
      json: jest.fn().mockReturnValue('json-format'),
      combine: jest.fn().mockReturnValue('combined-format')
    },
    transports: {
      Console: jest.fn().mockImplementation(() => ({ /* mock console transport */ }))
    }
  };
  return mLogger;
});

jest.mock('winston-loki', () => {
  return jest.fn().mockImplementation(() => ({ /* mock loki transport */ }));
});

jest.mock('./config/config', () => {
  return {
    Config: {
      instance: {
        config: {
          loki: {
            host: 'mock-loki-host',
            port: 3100
          }
        }
      }
    }
  };
});

describe('Logger', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = Logger.instance;
    const instance2 = Logger.instance;

    expect(instance1).toBe(instance2);
  });

  it('should create a winston logger with correct configuration', () => {
    const _logger = Logger.instance.getLogger();

    // Verify winston.createLogger was called with correct config
    expect(winston.createLogger).toHaveBeenCalledWith({
      transports: [
        expect.any(Object), // Console transport
        expect.any(Object)  // Loki transport
      ],
      format: 'combined-format',
      defaultMeta: {
        service: 'sysvisual-backend',
      },
    });

    // Verify format.combine was called with correct formats
    expect(winston.format.combine).toHaveBeenCalledWith(
      'timestamp-format',
      'json-format'
    );

    // Verify LokiTransport was created with correct config
    expect(LokiTransport).toHaveBeenCalledWith({
      host: 'mock-loki-host',
      json: true,
      labels: { service: 'sysvisual-backend' },
      interval: 100,
    });
  });
});
