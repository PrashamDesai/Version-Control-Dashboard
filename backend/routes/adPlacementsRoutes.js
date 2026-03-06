const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getAdPlacements,
    createAdPlacement,
    updateAdPlacement,
    deleteAdPlacement,
} = require('../controllers/adPlacementsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAdPlacements)
    .post(protect, admin, createAdPlacement);

router.route('/:id')
    .put(protect, admin, updateAdPlacement)
    .delete(protect, admin, deleteAdPlacement);

module.exports = router;
