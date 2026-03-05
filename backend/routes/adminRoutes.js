const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/adminController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication + at least admin role
router.get('/users', protect, admin, getAllUsers);
router.patch('/users/:id/role', protect, superAdmin, updateUserRole);
router.delete('/users/:id', protect, superAdmin, deleteUser);

module.exports = router;
