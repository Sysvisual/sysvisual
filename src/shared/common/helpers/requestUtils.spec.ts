import { getSite, getJWTPayload } from './requestUtils';
import { Request } from 'express';
import { Site } from '../../persistent/database/interface/Site';
import { WithId } from '../../persistent/objectMapper';
import { JwtPayload } from 'jsonwebtoken';

describe('requestUtils', () => {
  describe('getSite', () => {
    it('should extract Site from request headers', () => {
      // Create a mock site
      const mockSite: WithId<Site> = {
        _id: '123',
        name: 'Test Site',
        domains: ['example.com'],
        owner: 'user123'
      };

      // Create a mock request with the site in headers
      const mockRequest = {
        headers: {
          'X-Site': mockSite
        }
      } as unknown as Request;

      // Call the function
      const result = getSite(mockRequest);

      // Verify the result
      expect(result).toBe(mockSite);
    });
  });

  describe('getJWTPayload', () => {
    it('should extract JwtPayload from request headers', () => {
      // Create a mock JWT payload
      const mockPayload: JwtPayload = {
        sub: 'user123',
        iat: 1234567890,
        exp: 1234567890 + 3600
      };

      // Create a mock request with the JWT payload in headers
      const mockRequest = {
        headers: {
          'X-JWT-Payload': mockPayload
        }
      } as unknown as Request;

      // Call the function
      const result = getJWTPayload(mockRequest);

      // Verify the result
      expect(result).toBe(mockPayload);
    });
  });
});