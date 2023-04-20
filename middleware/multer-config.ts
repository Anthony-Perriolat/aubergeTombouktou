// import multer, { StorageEngine } from 'multer';
// import { Request } from 'express';

// const MIME_TYPES: Record<string, string> = {
//   'image/jpg': 'jpg',
//   'image/jpeg': 'jpg',
//   'image/png': 'png',
// };

// const storage: StorageEngine = multer.diskStorage({
//   destination: (req: Request, file: multer.File, callback: (error: Error | null, destination: string) => void) => {
//     callback(null, 'images');
//   },
//   filename: (req: Request, file: multer.File, callback: (error: Error | null, filename: string) => void) => {
//     const name: string = file.originalname.split(' ').join('_');
//     const extension: string = MIME_TYPES[file.mimetype];
//     callback(null, name + Date.now() + '.' + extension);
//   },
// });

// export default multer({ storage: storage }).single('image');


import { Request } from 'express'; 
import multer from 'multer'; 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },

  filename: function (req: Request, file: any, cb: any) {
        const name: string = file.originalname.split(' ').join('_');
    cb(null, file.originalname)
  }
}); 
const fileFilter = (req: Request, file: any, cb: any) => {
  if (file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Image uploaded is not of type jpg/jpeg or png"),false);}
  }
  export default multer({storage: storage, fileFilter : fileFilter});
    
