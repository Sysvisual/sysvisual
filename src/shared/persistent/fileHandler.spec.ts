import { deleteImages } from './fileHandler';
import fs from 'fs';
import { Config as _Config } from '../common/config/config';

// Mock dependencies
jest.mock('fs', () => ({
  rmSync: jest.fn()
}));

jest.mock('../common/config/config', () => ({
  Config: {
    instance: {
      config: {
        fileUploadDest: '/upload/'
      }
    }
  }
}));

describe('fileHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteImages', () => {
    it('should delete images from the filesystem', () => {
      // Create a list of image paths
      const imagePaths = ['image1.jpg', 'image2.png', 'image3.gif'];

      // Call the function
      deleteImages(imagePaths);

      // Verify fs.rmSync was called for each image
      expect(fs.rmSync).toHaveBeenCalledTimes(3);
      expect(fs.rmSync).toHaveBeenCalledWith('/upload/image1.jpg', { force: true });
      expect(fs.rmSync).toHaveBeenCalledWith('/upload/image2.png', { force: true });
      expect(fs.rmSync).toHaveBeenCalledWith('/upload/image3.gif', { force: true });
    });

    it('should handle empty array', () => {
      // Call the function with an empty array
      deleteImages([]);

      // Verify fs.rmSync was not called
      expect(fs.rmSync).not.toHaveBeenCalled();
    });
  });
});
