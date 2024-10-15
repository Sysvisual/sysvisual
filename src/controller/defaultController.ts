import { Router } from 'express';
import ProductController from './productController';
import UserController from './userController';
import categoryController from './categoryController';

const router = Router();

router.use('/users', UserController);
router.use('/products', ProductController);
router.use('/categories', categoryController);

export default router;
