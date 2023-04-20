import { Router } from 'express';
import * as categoriesArticleCrlt from '../controllers/categoriesArticle';
import {authMiddleware} from '../middleware/authMiddleware';
import permissionMiddleware from '../middleware/permission';

const router = Router();

router.get('/:id', categoriesArticleCrlt.getcategoriesArticleById);
router.get('/', categoriesArticleCrlt.getAllcategoriesArticle);
router.post('/', permissionMiddleware, categoriesArticleCrlt.createcategoriesArticle);
router.put('/:id', authMiddleware, permissionMiddleware, categoriesArticleCrlt.updatecategoriesArticle);
router.delete('/:id', authMiddleware, permissionMiddleware, categoriesArticleCrlt.deletecategoriesArticle);

export default router;