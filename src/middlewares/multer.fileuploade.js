// there will we be is use the mullter middleware and to uploade the files :
// task:
// take image avatar  from user 
// using mullter middleware
// and than uploade to cloudinary and than url will be in the db 
// this url will be the final url of images


import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.resolve(__dirname, '../../public/temp'));
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});


const upload = multer({ storage : storage});

export {upload};
