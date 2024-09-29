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
		const randomUUID = req.headers['X-RandomUUID'] ?? crypto.randomUUID();
		const uploadDir = `${fileUploadDest}/${randomUUID}`;

		req.headers['X-RandomUUID'] = randomUUID;
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir);
		}
		cb(null, uploadDir);
	},
	filename(req, file, cb) {
		const fileName = `${new Date().toISOString()}-${file.originalname}`;
		cb(null, encodeURI(fileName));
	},
});

export default multer({ storage });
