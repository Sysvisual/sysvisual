import fs from 'fs';

const getFile = async (productId: string, imageName: string): Promise<Buffer> => {
	return fs.readFileSync(`${process.env.FILE_UPLOAD_DEST}/${productId}/${imageName}`);
}

const writeFile = async (productId: string, imageName: string, file: Buffer): Promise<void> => {
	fs.writeFileSync(`${process.env.FILE_UPLOAD_DEST}/${productId}/${imageName}`, file);
}

export default {
	getFile,
	writeFile
}