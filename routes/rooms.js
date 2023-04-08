const router = require('express').Router()

const roomCrlt = require('../controllers/rooms')
const auth = require('../middleware/auth')
const permission = require('../middleware/permission')

router.get('/:id', roomCrlt.getRoomById)
router.get('/', roomCrlt.getAllRooms)
router.post('/', auth, permission, roomCrlt.createRoom)
router.put('/:id', auth, permission, roomCrlt.updateRoom)
router.delete('/:id', auth, permission, roomCrlt.deleteRoom)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , roomCrlt.getAllThings)

module.exports = router