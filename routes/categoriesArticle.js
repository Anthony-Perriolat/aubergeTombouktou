const router = require('express').Router()

const categoriesArticleCrlt = require('../controllers/categoriesArticle')
const auth = require('../middleware/auth')
const permission = require('../middleware/permission')

router.get('/:id', categoriesArticleCrlt.getcategoriesArticleById)
router.get('/', categoriesArticleCrlt.getAllcategoriesArticle)
router.post('/', permission, categoriesArticleCrlt.createcategoriesArticle)
router.put('/:id', auth, permission, categoriesArticleCrlt.updatecategoriesArticle)
router.delete('/:id', auth, permission, categoriesArticleCrlt.deletecategoriesArticle)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , categoriesArticleCrlt.getAllThings)

module.exports = router