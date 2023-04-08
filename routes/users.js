const router = require('express').Router()

const userCrlt = require('../controllers/users')
const auth = require('../middleware/auth')
const permission = require('../middleware/permission')

router.get('/myUser', auth, userCrlt.getMyUser)
router.put('/myUser', auth, userCrlt.updateMyUser)
router.delete('/myUser', auth, userCrlt.deleteMyUser)
router.get('/', auth, permission, userCrlt.getAllUsers)
router.post('/login', userCrlt.login)
router.post('/signUp', userCrlt.signUpUser)
router.put('/:id', auth, userCrlt.updateUser)


// router.delete('/:id', auth, userCrlt.deleteThing)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , userCrlt.getAllThings)

module.exports = router