import { Router } from 'express';
import UserController from './userController';
import AuthController from './authController';
import { detectSite } from '../middleware/detectSite';
import SiteController from './siteController';
import SchemaController from './schemaController';

const router = Router();

router.use('/auth', detectSite, AuthController);
router.use('/users', detectSite, UserController);
router.use('/sites', SiteController);
router.use('/schemas', detectSite, SchemaController);

export default router;
