import multer from 'multer';
import {Request} from 'express';
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../public/images'));
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({storage});

export {upload};