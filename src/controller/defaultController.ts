import { Router } from 'express';
import ProductController from './productController';
import UserController from './userController';
import categoryController from './categoryController';
import imageController from './imageController';
import AuthController from './authController';
import { detectSite } from '../middleware/detectSite';
import SiteController from './siteController';
import SchemaController from './schemaController';

const router = Router();

router.use('/auth', detectSite, AuthController);
router.use('/users', detectSite, UserController);
router.use('/sites', SiteController);
router.use('/products', detectSite, ProductController);
router.use('/schemas', detectSite, SchemaController);
router.use('/categories', detectSite, categoryController);
router.use('/images', detectSite, imageController);

export default router;
