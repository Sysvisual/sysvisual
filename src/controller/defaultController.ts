import { Router } from 'express';
import ProductController from './productController';
import UserController from './userController';
import categoryController from './categoryController';
import imageController from './imageController';

const router = Router();

router.use('/users', UserController);
router.use('/products', ProductController);
router.use('/categories', categoryController);
router.use('/images', imageController);

export default router;
