import fs from 'fs';

const IMAGE_BASE_PATH = process.env.FILE_UPLOAD_DEST ?? '/upload';
const deleteImages = (imagePaths: string[]) => {
	for (const image of imagePaths) {
		fs.rmSync(`${IMAGE_BASE_PATH}${image}`, { force: true });
	}
};

export { deleteImages };
