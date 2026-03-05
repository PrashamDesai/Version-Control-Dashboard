const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getEnvironments,
    updateEnvironment,
} = require('../controllers/environmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getEnvironments);

router.route('/:environment')
    .put(protect, admin, updateEnvironment);

module.exports = router;
