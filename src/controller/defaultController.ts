import { Router } from 'express';
import ProductController from './productController';
import UserController from './userController';

const router = Router();

router.use(UserController);
router.use(ProductController);

export default router;
