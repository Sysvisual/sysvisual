import { Router } from 'express';
import { checkTokenMiddleware } from '../middleware/checkToken';
import fs from 'fs';
import fileUpload from '../middleware/fileUpload';
import { getSite } from '../shared/common/helpers/requestUtils';
import { deleteImages } from '../shared/persistent/database/repository/ProductRepository';
import { Config } from '../shared/common/config/config';

const router = Router();

const IMAGE_BASE_PATH = Config.instance.config.fileUploadDest;

router.get('/:imageName', (req, res) => {
	const imageName = req.params.imageName;
	const imageSite = imageName.split('/')[0];

	if (
		!fs.existsSync(`${IMAGE_BASE_PATH}${imageName}`) ||
		imageSite !== getSite(req)._id.toString()
	) {
		return res.sendStatus(404);
	}

	res.sendFile(imageName, { root: IMAGE_BASE_PATH });
});

router.delete('/:imageName', checkTokenMiddleware, async (req, res) => {
	try {
		const image = req.params.imageName;
		const imagePath = `${IMAGE_BASE_PATH}/${image}`;
		const imageSite = image.split('/')[0];

		if (
			!fs.existsSync(imagePath) ||
			imageSite !== getSite(req)._id.toString()
		) {
			return res.sendStatus(404);
		}

		const deletedImages = await deleteImages(
			getSite(req)._id.toString(),
			imagePath
		);

		if (deletedImages.isError) {
			return res.sendStatus(500);
		}

		res.sendStatus(200);
	} catch (_) {
		return res.sendStatus(500);
	}
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
			(fileName) => `${getSite(req)._id}/${fileName}`
		);

		res.status(200).json(transformedFileNames);
	}
);

export default router;
