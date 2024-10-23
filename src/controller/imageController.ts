import { Router } from 'express';
import { checkTokenMiddleware } from '../middleware/checkToken';
import fs from 'fs';
import fileUpload from '../middleware/fileUpload';
import ProductModel from '../models/productModel';
import { getLogger } from '../utils';

const router = Router();

const IMAGE_BASE_PATH = process.env.FILE_UPLOAD_DEST ?? '/upload';

router.get('/:imageName', (req, res) => {
	const imageName = req.params.imageName;

	if (!fs.existsSync(`${IMAGE_BASE_PATH}${imageName}`)) {
		return res.sendStatus(404);
	}

	res.sendFile(imageName, { root: IMAGE_BASE_PATH });
});

router.delete('/:imageName', checkTokenMiddleware, async (req, res) => {
	const image = req.params.imageName;
	const imagePath = `${IMAGE_BASE_PATH}/${image}`;

	if (!fs.existsSync(imagePath)) {
		return res.sendStatus(404);
	}

	try {
		await ProductModel.updateMany(
			{},
			{
				$pull: {
					images: {
						$in: imagePath,
					},
				},
			},
			{ new: true }
		);
	} catch (_) {
		getLogger().error('Could not delete image', { path: imagePath });
		return res.sendStatus(500);
	}
	fs.rmSync(imagePath);
	res.sendStatus(200);
});

router.post(
	'/',
	checkTokenMiddleware,
	fileUpload.array('images'),
	(req, res) => {
		const imageFiles = req.files;
		const imageFileNames: Array<string> | undefined = new Array<string>();

		if (imageFiles) {
			if (imageFiles instanceof Array) {
				for (const file of imageFiles) {
					imageFileNames.push(file.filename);
				}
			} else {
				for (const directory in imageFiles) {
					for (const file of imageFiles[directory]) {
						imageFileNames.push(`${directory}/${file}`);
					}
				}
			}
		}

		if (imageFileNames.length <= 0) {
			return res.sendStatus(400);
		}

		const transformedFileNames: Array<string> = imageFileNames.map(
			(fileName) => `${req.headers['X-RandomUUID']}/${fileName}`
		);

		res.status(200).json(transformedFileNames);
	}
);

export default router;
