import {
  generateJWT,
  verifyJWT,
  getJWTPayload,
  setAuthCookie,
  clearAuthCookie,
  checkAuth
} from './jwt';
import jwt from 'jsonwebtoken';
import { User } from '../persistent/database/interface/User';
import { WithId } from '../persistent/objectMapper';
import { Response, Request } from 'express';
import { Config as _Config } from '../common/config/config';
import { PopulatedSite } from '../persistent/database/interface/Site';

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockResolvedValue('mock-token'),
  verify: jest.fn(),
  decode: jest.fn()
}));

jest.mock('../common/config/config', () => ({
  Config: {
    instance: {
      config: {
        jwtSecret: 'mock-secret'
      }
    }
  }
}));

describe('JWT Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJWT', () => {
    it('should generate a JWT token for a user', async () => {
      // Create a mock user
      const mockUser: WithId<User> = {
        _id: '123',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: Date.now(),
        contactDetails: 'contact123',
        site: 'site123'
      };

      // Call the function
      const token = await generateJWT(mockUser);

      // Verify jwt.sign was called with correct parameters
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          user: {
            username: 'testuser',
            id: '123'
          }
        },
        'mock-secret',
        {
          algorithm: 'HS512',
          expiresIn: expect.any(Number),
          issuer: 'sysvisual',
          audience: 'testuser'
        }
      );

      // Verify the result
      expect(token).toBe('mock-token');
    });
  });

  describe('verifyJWT', () => {
    it('should return true for a valid token', () => {
      // Mock jwt.verify to return a payload
      (jwt.verify as jest.Mock).mockReturnValue({ user: { id: '123' } });

      // Call the function
      const result = verifyJWT('valid-token');

      // Verify jwt.verify was called with correct parameters
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'mock-secret');

      // Verify the result
      expect(result).toBe(true);
    });

    it('should return false for an invalid token', () => {
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Call the function
      const result = verifyJWT('invalid-token');

      // Verify the result
      expect(result).toBe(false);
    });

    it('should return false for undefined token', () => {
      // Call the function with undefined
      const result = verifyJWT(undefined);

      // Verify jwt.verify was not called
      expect(jwt.verify).not.toHaveBeenCalled();

      // Verify the result
      expect(result).toBe(false);
    });
  });

  describe('getJWTPayload', () => {
    it('should return payload for a valid token', () => {
      // Create a mock payload
      const mockPayload = { user: { id: '123' } };

      // Mock jwt.decode to return the payload
      (jwt.decode as jest.Mock).mockReturnValue(mockPayload);

      // Call the function
      const result = getJWTPayload('valid-token');

      // Verify jwt.decode was called with correct parameters
      expect(jwt.decode).toHaveBeenCalledWith('valid-token', { json: true });

      // Verify the result
      expect(result).toBe(mockPayload);
    });

    it('should return undefined for an invalid token', () => {
      // Mock jwt.decode to throw an error
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Call the function
      const result = getJWTPayload('invalid-token');

      // Verify the result
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined token', () => {
      // Call the function with undefined
      const result = getJWTPayload(undefined);

      // Verify jwt.decode was not called
      expect(jwt.decode).not.toHaveBeenCalled();

      // Verify the result
      expect(result).toBeUndefined();
    });
  });

  describe('setAuthCookie', () => {
    it('should set auth cookie with token', async () => {
      // Create a mock user
      const mockUser: WithId<User> = {
        _id: '123',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: Date.now(),
        contactDetails: 'contact123',
        site: 'site123'
      };

      // Create a mock response
      const mockResponse = {
        cookie: jest.fn()
      } as unknown as Response;

      // Call the function
      await setAuthCookie(mockResponse, mockUser);

      // Verify generateJWT was called
      expect(jwt.sign).toHaveBeenCalled();

      // Verify response.cookie was called with correct parameters
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        'mock-token',
        {
          expires: expect.any(Date),
          sameSite: 'none',
          secure: true,
          httpOnly: true
        }
      );
    });
  });

  describe('clearAuthCookie', () => {
    it('should clear auth cookie', async () => {
      // Create a mock response
      const mockResponse = {
        cookie: jest.fn()
      } as unknown as Response;

      // Call the function
      await clearAuthCookie(mockResponse);

      // Verify response.cookie was called with correct parameters
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        '',
        {
          expires: expect.any(Date),
          sameSite: 'none',
          secure: true,
          httpOnly: true
        }
      );

      // Verify the expiration date is in the past
      const expirationDate = (mockResponse.cookie as jest.Mock).mock.calls[0][2].expires;
      expect(expirationDate.getTime()).toBe(0);
    });
  });

  describe('checkAuth', () => {
    it('should return true for authenticated request', () => {
      // Mock verifyJWT to return true
      (jwt.verify as jest.Mock).mockReturnValue(true);

      // Create a mock payload
      const mockPayload = {
        user: {
          id: '123'
        }
      };

      // Mock getJWTPayload to return the payload
      (jwt.decode as jest.Mock).mockReturnValue(mockPayload);

      // Create a mock site
      const mockSite = {
        id: 'site123',
        name: 'Test Site',
        domains: ['example.com'],
        owner: {
          _id: '123',
          username: 'testuser',
          password: 'hashed-password',
          createdAt: Date.now(),
          contactDetails: '{}',
          site: 'site123'
        }
      } as unknown as PopulatedSite;

      // Create a mock request
      const mockRequest = {
        cookies: {
          token: 'valid-token'
        },
        headers: {
          'X-Site': mockSite
        }
      } as unknown as Request;

      // Call the function
      const result = checkAuth(mockRequest);

      // Verify the result
      expect(result).toBe(true);
    });

    it('should return false for unauthenticated request', () => {
      // Mock verifyJWT to return false
      (jwt.verify as jest.Mock).mockReturnValue(false);

      // Create a mock payload
      const mockPayload = {
        user: {
          id: '123'
        }
      };

      // Mock getJWTPayload to return the payload
      (jwt.decode as jest.Mock).mockReturnValue(mockPayload);

      // Create a mock site
      const mockSite = {
        id: 'site123',
        name: 'Test Site',
        domains: ['example.com'],
        owner: {
          _id: '456', // Different user ID
          username: 'otheruser',
          password: 'hashed-password',
          createdAt: Date.now(),
          contactDetails: '{}',
          site: 'site123'
        }
      } as unknown as PopulatedSite;

      // Create a mock request
      const mockRequest = {
        cookies: {
          token: 'valid-token'
        },
        headers: {
          'X-Site': mockSite
        }
      } as unknown as Request;

      // Call the function
      const result = checkAuth(mockRequest);

      // Verify the result
      expect(result).toBe(false);
    });

    it('should return false for request without token', () => {
      // Create a mock request without token
      const mockRequest = {
        cookies: {},
        headers: {}
      } as unknown as Request;

      // Call the function
      const result = checkAuth(mockRequest);

      // Verify the result
      expect(result).toBe(false);
    });
  });
});
