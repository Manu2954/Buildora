const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const {protect} = require('./auth.middleware')
router.post('/register', authController.signup);
router.get('/verify', authController.verify);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', protect, authController.logout);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.put('/updatedetails', protect, authController.updateDetails);
router.put('/updatepassword', protect, authController.updatePassword);

module.exports = router;
