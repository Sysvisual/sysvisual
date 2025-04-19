import fs from 'fs';
import { Config } from '../common/config/config';

const deleteImages = (imagePaths: string[]) => {
	const IMAGE_BASE_PATH = Config.instance.config.fileUploadDest;
	for (const image of imagePaths) {
		fs.rmSync(`${IMAGE_BASE_PATH}${image}`, { force: true });
	}
};

export { deleteImages };
