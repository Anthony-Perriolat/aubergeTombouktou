import { Router } from 'express';

import * as BookingCrlt from '../controllers/bookings';
import {authMiddleware} from '../middleware/authMiddleware';
import permission from '../middleware/permission';

const router = Router();

router.get('/preview/:id', BookingCrlt.getAllBookingsPreview);
router.get('/:id', authMiddleware, BookingCrlt.getBookingById);
router.get('/myBookings', authMiddleware, BookingCrlt.getMyBookings);
router.get('/', authMiddleware, permission, BookingCrlt.getAllBookings);
router.post('/', authMiddleware, BookingCrlt.createBooking);
router.put('/:id', authMiddleware, BookingCrlt.updateBooking);
router.delete('/:id', authMiddleware, BookingCrlt.deleteBooking);

export default router;