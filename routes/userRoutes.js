const express = require('express');
const userControler = require('./../controlers/userControler');
const authControler = require('../controlers/authControler');


const router = express.Router();

router.post('/signup', authControler.signup)
router.post('/login', authControler.login)
router.get('/logout', authControler.logout)
router.post('/forgotPassword', authControler.forgotPassword)
router.patch('/resetPassword/:token', authControler.resetPassword)

// middleware.....it runs in sequence and will protect all other router below
router.use(authControler.protect);


router.patch('/updateMyPassword', authControler.updatePassword)

router.get('/me', userControler.getMe, userControler.getUser);
router.delete('/deleteMe', userControler.deleteMe);
router.patch(
  '/updateMe', 
  userControler.uploadUserPhoto,
  userControler.resizeUserPhoto, 
  userControler.updateMe);
  


router.use(authControler.restrictTo('admin'));

router
  .route('/')
  .get(userControler.getAllUsers)
  .post(userControler.createUser);

router
    .route('/:id')
    .get(userControler.getUser)
    .patch(userControler.updateUser)
    .delete(userControler.deleteUser);


module.exports = router;
