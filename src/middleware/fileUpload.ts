import multer from 'multer';
import fs from 'fs';
import { urlencoded } from 'express';

if (!fs.existsSync(process.env.FILE_UPLOAD_DEST ?? '')) {
	fs.mkdirSync(process.env.FILE_UPLOAD_DEST ?? '');
}

const storage = multer.diskStorage({
	destination(req, file, cb) {
		const fileUploadDest = process.env.FILE_UPLOAD_DEST;

		if (!fileUploadDest) {
			return cb(new Error('file upload destination is not set!'), '');
		}

		cb(null, fileUploadDest);
	},
	filename(req, file, cb) {
		const fileName = `${file.originalname}-${new Date().toISOString()}`;
		cb(null, encodeURI(fileName));
	},
});

export default multer({ storage });
