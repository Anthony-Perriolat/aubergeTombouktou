const router = require('express').Router()

const ArticleCrlt = require('../controllers/articles')
const auth = require('../middleware/auth')

router.get('/:id', ArticleCrlt.getArticleById)
router.get('/', ArticleCrlt.getAllArticles)
router.post('/', auth, ArticleCrlt.createArticle)
router.put('/:id', auth, ArticleCrlt.updateArticle)
router.delete('/:id', auth, ArticleCrlt.deleteArticle)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , ArticleCrlt.getAllThings)

module.exports = router