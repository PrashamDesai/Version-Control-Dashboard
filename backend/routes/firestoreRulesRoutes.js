const express = require('express');
const { getFirestoreRules, updateFirestoreRules } = require('../controllers/firestoreRulesController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(protect, getFirestoreRules)
    .put(protect, admin, updateFirestoreRules);

module.exports = router;
