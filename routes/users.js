const router = require('express').Router()

const userCrlt = require('../controllers/users')
const auth = require('../middleware/auth')

router.get('/:id', auth, userCrlt.getMyUser)
router.get('/', auth, userCrlt.getAllUsers)
router.post('/login', userCrlt.login)
router.post('/signUp', userCrlt.signUpUser)
router.put('/:id', auth, userCrlt.updateUser)


// router.delete('/:id', auth, userCrlt.deleteThing)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , userCrlt.getAllThings)

module.exports = router