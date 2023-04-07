const router = require('express').Router()

const BookingCrlt = require('../controllers/bookings')
const auth = require('../middleware/auth')

router.get('/:id', BookingCrlt.getBookingById)
router.get('/', BookingCrlt.getAllBookings)
router.post('/', auth, BookingCrlt.createBooking)
router.put('/:id', auth, BookingCrlt.updateBooking)
router.delete('/:id', auth, BookingCrlt.deleteBooking)


//        methode ('route', middleware, controllers)
// router.get('/', auth, , BookingCrlt.getAllThings)

module.exports = router