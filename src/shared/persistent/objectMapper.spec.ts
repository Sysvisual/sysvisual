import {
  mapProductToDTO,
  mapCategoryToDTO,
  mapAddressToDTO,
  mapContactDetailsToDTO as _mapContactDetailsToDTO,
  mapUserToDTO as _mapUserToDTO,
  mapSiteToDTO as _mapSiteToDTO,
  WithId
} from './objectMapper';
import { Types } from 'mongoose';
import { PopulatedProduct } from './database/interface/Product';
import { PopulatedCategory } from './database/interface/Category';
import { Address } from './database/interface/Address';
import { PopulatedContactDetails as _PopulatedContactDetails } from './database/interface/ContactDetails';
import { PopulatedUser as _PopulatedUser } from './database/interface/User';
import { PopulatedSite as _PopulatedSite } from './database/interface/Site';

describe('objectMapper', () => {
  describe('mapProductToDTO', () => {
    it('should map a product to a DTO', () => {
      // Create a mock product
      const mockProduct: WithId<PopulatedProduct> = {
        _id: new Types.ObjectId('5f7d7c3f9d3e2a1a2c3b4d5e'),
        title: 'Test Product',
        description: 'A test product',
        price: 1099, // 10.99 in cents
        images: ['image1.jpg', 'image2.jpg'],
        hidden: false,
        categories: ['category1', 'category2'],
        site: { name: 'Test Site', domains: [], owner: { _id: '123', username: 'testuser', password: 'password', contactDetails: { _id: '456', email: 'test@example.com', firstname: 'Test', surname: 'User', addresses: [] }, createdAt: Date.now() } } as unknown as PopulatedSite
      };

      // Call the function
      const dto = mapProductToDTO(mockProduct);

      // Verify the result
      expect(dto).toEqual({
        id: '5f7d7c3f9d3e2a1a2c3b4d5e',
        title: 'Test Product',
        description: 'A test product',
        price: 10.99, // Converted from cents
        images: ['image1.jpg', 'image2.jpg'],
        hidden: false,
        categories: ['category1', 'category2']
      });
    });

    it('should throw an error if product ID is undefined', () => {
      // Create a mock product with undefined ID
      const mockProduct = {
        _id: undefined,
        title: 'Test Product',
        description: 'A test product',
        price: 1099,
        images: ['image1.jpg', 'image2.jpg'],
        hidden: false,
        categories: ['category1', 'category2']
      } as unknown as WithId<PopulatedProduct>;

      // Expect the function to throw
      expect(() => mapProductToDTO(mockProduct)).toThrow(
        'Id of product can not be undefined'
      );
    });
  });

  describe('mapCategoryToDTO', () => {
    it('should map a category to a DTO', () => {
      // Create mock products
      const mockProducts = [
        {
          _id: new Types.ObjectId('5f7d7c3f9d3e2a1a2c3b4d5e'),
          title: 'Product 1',
          description: 'Description 1',
          price: 1099,
          images: ['image1.jpg'],
          hidden: false,
          categories: ['category1'],
          site: { name: 'Test Site', domains: [], owner: { _id: '123', username: 'testuser', password: 'password', contactDetails: { _id: '456', email: 'test@example.com', firstname: 'Test', surname: 'User', addresses: [] }, createdAt: Date.now() } } as unknown as PopulatedSite
        },
        {
          _id: new Types.ObjectId('5f7d7c3f9d3e2a1a2c3b4d5f'),
          title: 'Product 2',
          description: 'Description 2',
          price: 2099,
          images: ['image2.jpg'],
          hidden: true,
          categories: ['category1'],
          site: { name: 'Test Site', domains: [], owner: { _id: '123', username: 'testuser', password: 'password', contactDetails: { _id: '456', email: 'test@example.com', firstname: 'Test', surname: 'User', addresses: [] }, createdAt: Date.now() } } as unknown as PopulatedSite
        }
      ];

      // Create a mock category
      const mockCategory: WithId<PopulatedCategory> = {
        _id: new Types.ObjectId('5f7d7c3f9d3e2a1a2c3b4d60'),
        name: 'Test Category',
        description: 'A test category',
        items: mockProducts as unknown as Array<Product>
      };

      // Call the function
      const dto = mapCategoryToDTO(mockCategory);

      // Verify the result
      expect(dto).toEqual({
        id: '5f7d7c3f9d3e2a1a2c3b4d60',
        name: 'Test Category',
        description: 'A test category',
        items: [
          {
            id: '5f7d7c3f9d3e2a1a2c3b4d5e',
            title: 'Product 1',
            description: 'Description 1',
            price: 10.99,
            images: ['image1.jpg'],
            hidden: false,
            categories: ['category1']
          },
          {
            id: '5f7d7c3f9d3e2a1a2c3b4d5f',
            title: 'Product 2',
            description: 'Description 2',
            price: 20.99,
            images: ['image2.jpg'],
            hidden: true,
            categories: ['category1']
          }
        ],
        amountItems: 2
      });
    });

    it('should throw an error if category ID is undefined', () => {
      // Create a mock category with undefined ID
      const mockCategory = {
        _id: undefined,
        name: 'Test Category',
        description: 'A test category',
        items: []
      } as unknown as WithId<PopulatedCategory>;

      // Expect the function to throw
      expect(() => mapCategoryToDTO(mockCategory)).toThrow(
        'ID of category can not be undefined'
      );
    });
  });

  describe('mapAddressToDTO', () => {
    it('should map an address to a DTO', () => {
      // Create a mock address
      const mockAddress: WithId<Address> = {
        _id: new Types.ObjectId('5f7d7c3f9d3e2a1a2c3b4d5e'),
        street: '123 Main St',
        house_number: '42',
        city: 'Anytown',
        state: 'State',
        country: 'Country',
        zip: '12345'
      };

      // Call the function
      const dto = mapAddressToDTO(mockAddress);

      // Verify the result
      expect(dto).toEqual({
        id: '5f7d7c3f9d3e2a1a2c3b4d5e',
        street: '123 Main St',
        house_number: '42',
        city: 'Anytown',
        state: 'State',
        country: 'Country',
        zip: '12345'
      });
    });

    it('should throw an error if address ID is undefined', () => {
      // Create a mock address with undefined ID
      const mockAddress = {
        _id: undefined,
        street: '123 Main St',
        house_number: '42',
        city: 'Anytown',
        state: 'State',
        country: 'Country',
        zip: '12345'
      } as unknown as WithId<Address>;

      // Expect the function to throw
      expect(() => mapAddressToDTO(mockAddress)).toThrow(
        'ID of address can not be undefined'
      );
    });
  });

  // Additional tests for other mapping functions would follow the same pattern
});
