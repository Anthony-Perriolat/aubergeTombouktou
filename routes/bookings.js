const router = require('express').Router()

const BookingCrlt = require('../controllers/bookings')
const auth = require('../middleware/auth')
const permission = require('../middleware/permission')


router.get('/:id', auth, BookingCrlt.getBookingById)
router.get('/myBookings', auth, BookingCrlt.getMyBookings)
router.get('/', auth, permission, BookingCrlt.getAllBookings)
router.post('/', auth, BookingCrlt.createBooking)
router.put('/:id', auth, BookingCrlt.updateBooking)
router.delete('/:id', auth, BookingCrlt.deleteBooking)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , BookingCrlt.getAllThings)

module.exports = router