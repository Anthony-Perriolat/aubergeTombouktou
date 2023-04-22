import { Router } from 'express';
import * as PaymentCtrl from '../controllers/payments';
import {authMiddleware} from '../middleware/authMiddleware';

const router = Router();

// router.post('/successPayment', authMiddleware, PaymentCtrl.successPayment)
// router.post('/failPayment', authMiddleware, PaymentCtrl.failPayment)
router.post('/', authMiddleware, PaymentCtrl.retrievePayment)


export default router;
