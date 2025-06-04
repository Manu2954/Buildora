const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/register', authController.signup);
router.get('/verify', authController.verify);
router.post('/request-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.post('/login', authController.login);

module.exports = router;
