const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getAdPlacements,
    createAdPlacement,
    updateAdPlacement,
    deleteAdPlacement,
} = require('../controllers/adPlacementsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getAdPlacements)
    .post(protect, createAdPlacement);

router.route('/:id')
    .put(protect, updateAdPlacement)
    .delete(protect, deleteAdPlacement);

module.exports = router;
