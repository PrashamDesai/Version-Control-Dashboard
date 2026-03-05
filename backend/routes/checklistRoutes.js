const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getChecklist,
    updateChecklist,
    createChecklist,
    deleteChecklist
} = require('../controllers/checklistController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getChecklist)
    .post(protect, admin, createChecklist);

router.route('/:id')
    .put(protect, admin, updateChecklist)
    .delete(protect, admin, deleteChecklist);

module.exports = router;
