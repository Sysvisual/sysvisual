import { Router } from 'express';
import ProductController from './productController';
import UserController from './userController';

const router = Router();

const website = `<!DOCTYPE html>
<html>
<head>
  <title>File Upload</title>
</head>
<body>
  <h1>File Upload</h1>
  <form action="http://localhost:8080/product" method="POST" enctype="multipart/form-data">
    <input type="text" placeholder="Titel" name="title" required>
    <input type="text" placeholder="Beschreibung" name="description" required>
    <input type="number" placeholder="Preis €" name="price" required>
    <input type="file" name="image" required>
    <button type="submit">Upload</button>
  </form>
</body>
</html>
`;

router.use(UserController);
router.use(ProductController);
router.get('', (req, res) => {
	res.status(200).send(website);
});

export default router;
