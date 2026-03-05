const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getAds,
    createAd,
    updateAd,
} = require('../controllers/adsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAds)
    .post(protect, admin, createAd);

router.route('/:id')
    .put(protect, admin, updateAd);

module.exports = router;
