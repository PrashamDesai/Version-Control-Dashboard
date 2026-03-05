const asyncHandler = require('../utils/asyncHandler');
const FirestoreRules = require('../models/FirestoreRules');
const { successResponse } = require('../utils/responseFormat');

// @desc    Get firestore rules for a game
// @route   GET /api/games/:gameId/firestore-rules
// @access  Private
const getFirestoreRules = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const rules = await FirestoreRules.findOne({ gameId });

    // Return empty strings if no config exists yet to keep the frontend happy
    if (!rules) {
        return successResponse(res, 200, 'Rules fetched', { productionRules: '', developmentRules: '' });
    }

    successResponse(res, 200, 'Rules fetched', rules);
});

// @desc    Update firestore rules for a game
// @route   PUT /api/games/:gameId/firestore-rules
// @access  Private
const updateFirestoreRules = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const { productionRules, developmentRules } = req.body;

    const rules = await FirestoreRules.findOneAndUpdate(
        { gameId },
        { gameId, productionRules, developmentRules },
        { new: true, runValidators: true, upsert: true }
    );

    successResponse(res, 200, 'Rules updated successfully', rules);
});

module.exports = { getFirestoreRules, updateFirestoreRules };
