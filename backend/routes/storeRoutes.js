const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getStoreListing,
    updateStoreListing,
} = require('../controllers/storeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getStoreListing)
    .put(protect, admin, updateStoreListing);

module.exports = router;
