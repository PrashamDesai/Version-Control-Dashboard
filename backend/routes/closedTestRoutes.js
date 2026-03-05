const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getReports,
    createReport,
} = require('../controllers/closedTestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getReports)
    .post(protect, admin, createReport);

module.exports = router;
