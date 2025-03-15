import fs from 'fs';
import { Config } from '../common/config/config';

const IMAGE_BASE_PATH = Config.instance.config.fileUploadDest;
const deleteImages = (imagePaths: string[]) => {
	for (const image of imagePaths) {
		fs.rmSync(`${IMAGE_BASE_PATH}${image}`, { force: true });
	}
};

export { deleteImages };
