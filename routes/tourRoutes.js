const express = require('express');
const tourControler = require('../controlers/tourControler');
const authControler = require('../controlers/authControler');
const router = express.Router();
const reviewRoutes = require('../routes/reviewRoutes');



router.use('/:tourId/reviews', reviewRoutes)


router
  .route('/top-5-cheap')
  .get(tourControler.aliasTopTours,tourControler.getAllTours);

router.route('/tour-stats').get(tourControler.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authControler.protect,
    authControler.restrictTo('admin', 'lead-guide', 'guide'),
    tourControler.getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControler.getToursWithin);
// tours-distance?distance=233&center=-40,45&unit=mi
// /tours-distance/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourControler.getDistances);

router
  .route('/')
  .get( tourControler.getAllTours )
  .post(authControler.protect, authControler.restrictTo('admin', 'lead-guide') ,tourControler.createTour);

router
  .route('/:id')
  .get(tourControler.getTour)
  .patch(
    authControler.protect,
    authControler.restrictTo('admin', 'lead-guide'),
    tourControler.uploadTourImages,
    tourControler.resizeTourImages,
    tourControler.updateTour)
  .delete(
     authControler.protect,
     authControler.restrictTo('admin', 'lead-guide'), 
     tourControler.deleteTour);




module.exports = router;
