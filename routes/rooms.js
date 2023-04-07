const router = require('express').Router()

const roomCrlt = require('../controllers/rooms')
const auth = require('../middleware/auth')

router.get('/:id', roomCrlt.getRoomById)
router.get('/', roomCrlt.getAllRooms)
router.post('/', auth, roomCrlt.createRoom)
router.put('/:id', auth, roomCrlt.updateRoom)
router.delete('/:id', auth, roomCrlt.deleteRoom)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , roomCrlt.getAllThings)

module.exports = router