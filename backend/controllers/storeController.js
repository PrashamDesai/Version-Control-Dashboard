const asyncHandler = require('../utils/asyncHandler');
const StoreListing = require('../models/StoreListing');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get store listing configuration
// @route   GET /api/games/:gameId/store
// @access  Private
const getStoreListing = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const listings = await StoreListing.find({ gameId });
    successResponse(res, 200, 'Store listing fetched', listings || []);
});

// @desc    Update store listing (upsert)
// @route   PUT /api/games/:gameId/store
// @access  Private/Admin
const updateStoreListing = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const { platform } = req.body;
    req.body.gameId = gameId;

    if (!platform) {
        return errorResponse(res, 400, 'Platform is required');
    }

    let settings = await StoreListing.findOneAndUpdate(
        { gameId, platform },
        req.body,
        { new: true, runValidators: true, upsert: true }
    );

    successResponse(res, 200, 'Store listing updated', settings);
});

module.exports = { getStoreListing, updateStoreListing };
