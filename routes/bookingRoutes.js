const express = require('express');
const authControler = require('../controlers/authControler');
const bookingControler = require('../controlers/bookingControler');


const router = express.Router();
router.use(authControler.protect)

router.get('/checkout-session/:tourID', bookingControler.getCheckoutSession)

router.use(authControler.restrictTo('admin', 'lead-guide'))

router.route('/').get(bookingControler.getAllBookings)
                 .post(bookingControler.createBooking)

router.route('/:id')
    .get(bookingControler.getBooking)
    .patch(bookingControler.updateBooking)
    .delete(bookingControler.deleteBooking)

module.exports = router;

