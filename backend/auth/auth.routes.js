const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const {protect} = require('./auth.middleware')
router.post('/register', authController.signup);
router.get('/verify', authController.verify);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
