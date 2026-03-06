const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getLinks,
    createLink,
    deleteLink,
} = require('../controllers/linkController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getLinks)
    .post(protect, admin, createLink);

router.route('/:id')
    .delete(protect, admin, deleteLink);

module.exports = router;
