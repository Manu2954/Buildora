const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/admin/userController');

// Import authentication middleware
// I am assuming you have a middleware that verifies the JWT and attaches the admin to req.admin
const { adminAuth } = require('../middleware/adminAuth'); // Example middleware

// All routes in this file are protected and require an 'admin' role.
// The `protect` middleware checks for a valid token.
// The `authorize('admin', 'superadmin')` middleware checks if the user's role is allowed.
router.use(adminAuth);
// router.use(authorize('admin', 'superadmin'));

// Route definitions
router.route('/')
    .get(getAllUsers);

router.route('/:userId')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
