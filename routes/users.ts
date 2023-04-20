    import express from 'express';

    import * as userCrlt from '../controllers/users';
    import {authMiddleware} from '../middleware/authMiddleware';
    import permission from '../middleware/permission';

    const router = express.Router();

    router.get('/myUser', authMiddleware, userCrlt.getMyUser);
    router.put('/myUser', authMiddleware, userCrlt.updateMyUser);
    router.delete('/myUser', authMiddleware, userCrlt.deleteMyUser);
    router.get('/', authMiddleware, permission, userCrlt.getAllUsers);
    router.post('/login', userCrlt.login);
    router.post('/signUp', userCrlt.signUpUser);
    router.put('/:id', authMiddleware, userCrlt.updateUser);

    export default router;