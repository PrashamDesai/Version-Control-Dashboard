const express = require('express');
const { getFirestoreRules, updateFirestoreRules } = require('../controllers/firestoreRulesController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(protect, getFirestoreRules)
    .put(protect, updateFirestoreRules);

module.exports = router;
