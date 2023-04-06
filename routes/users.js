const router = require('express').Router()

const staffCrlt = require('../controllers/stuff')
const auth = require('../middleware/auth')

router.post('/', auth, staffCrlt.createThing)

router.put('/:id', auth, staffCrlt.updateThing)

router.delete('/:id', auth, staffCrlt.deleteThing)

router.get('/:id', auth, staffCrlt.getOneThing)

router.get('/', auth, staffCrlt.getAllThings)
//        methode ('route', middleware, controllers)
// router.get('/', auth, , staffCrlt.getAllThings)

module.exports = router