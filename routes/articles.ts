import { Router } from 'express';
import * as ArticleCrlt from '../controllers/articles';
import {authMiddleware} from '../middleware/authMiddleware';
import permission from '../middleware/permission';

const router = Router();

router.get('/:id', ArticleCrlt.getArticleById)
router.get('/', ArticleCrlt.getAllArticles)
router.post('/', authMiddleware, permission, ArticleCrlt.createArticle)
router.put('/:id', authMiddleware, permission, ArticleCrlt.updateArticle)
router.delete('/:id', authMiddleware, permission, ArticleCrlt.deleteArticle)
router.delete('img/:id', authMiddleware, permission, ArticleCrlt.deleteImageArticle);


export default router;
