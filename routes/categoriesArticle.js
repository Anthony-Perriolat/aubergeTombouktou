const router = require('express').Router()

const categoriesArticleCrlt = require('../controllers/categoriesArticle')
const auth = require('../middleware/auth')

router.get('/:id', categoriesArticleCrlt.getcategoriesArticleById)
router.get('/', categoriesArticleCrlt.getAllcategoriesArticle)
router.post('/', auth, categoriesArticleCrlt.createcategoriesArticle)
router.put('/:id', auth, categoriesArticleCrlt.updatecategoriesArticle)
router.delete('/:id', auth, categoriesArticleCrlt.deletecategoriesArticle)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , categoriesArticleCrlt.getAllThings)

module.exports = router