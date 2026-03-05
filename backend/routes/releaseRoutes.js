const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getReleases,
    createRelease,
    updateRelease,
    deleteRelease,
} = require('../controllers/releaseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getReleases)
    .post(protect, createRelease);

router.route('/:id')
    .put(protect, admin, updateRelease)
    .delete(protect, admin, deleteRelease);

module.exports = router;
