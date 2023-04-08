const router = require('express').Router()

const ArticleCrlt = require('../controllers/articles')
const auth = require('../middleware/auth')
const permission = require('../middleware/permission')

router.get('/:id', ArticleCrlt.getArticleById)
router.get('/', ArticleCrlt.getAllArticles)
router.post('/', auth, permission, ArticleCrlt.createArticle)
router.put('/:id', auth, permission, ArticleCrlt.updateArticle)
router.delete('/:id', auth, permission, ArticleCrlt.deleteArticle)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , ArticleCrlt.getAllThings)

module.exports = router