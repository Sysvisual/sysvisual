import { Router } from 'express';
import { checkTokenMiddleware } from '../middleware/checkToken';

const router = Router();

router.get('/', checkTokenMiddleware, (req, res) => {
	res.sendStatus(200);
});

export default router;
