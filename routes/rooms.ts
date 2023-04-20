import { Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';

import * as roomCrlt from '../controllers/rooms';
import {authMiddleware} from '../middleware/authMiddleware';
import permission from '../middleware/permission';
import multer from '../middleware/multer-config';

const router = Router();

router.get('/:id', roomCrlt.getRoomById);
router.get('/', roomCrlt.getAllRooms);
router.post('/', authMiddleware, permission, multer.array('images',5), roomCrlt.createRoom as RequestHandler);
router.put('/:id', authMiddleware, permission, multer.array('images',5), roomCrlt.updateRoom as RequestHandler);
router.delete('/:id', authMiddleware, permission, roomCrlt.deleteRoom);
router.delete('img/:id', authMiddleware, permission, roomCrlt.deleteImageRoom);

export default router;
