const asyncHandler = require('../utils/asyncHandler');
const AdsConfig = require('../models/AdsConfig');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get all ads configs for a game
// @route   GET /api/games/:gameId/ads
// @access  Private
const getAds = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const ads = await AdsConfig.find({ gameId });
    successResponse(res, 200, 'Ads configurations fetched', ads);
});

// @desc    Create an ad config
// @route   POST /api/games/:gameId/ads
// @access  Private/Admin
const createAd = asyncHandler(async (req, res) => {
    req.body.gameId = req.params.gameId;
    const ad = await AdsConfig.create(req.body);
    successResponse(res, 201, 'Ad configuration created', ad);
});

// @desc    Update an ad config
// @route   PUT /api/games/:gameId/ads/:id
// @access  Private/Admin
const updateAd = asyncHandler(async (req, res) => {
    const { gameId, id } = req.params;
    const ad = await AdsConfig.findOneAndUpdate(
        { _id: id, gameId },
        req.body,
        { new: true, runValidators: true }
    );

    if (!ad) return errorResponse(res, 404, 'Ad configuration not found');

    successResponse(res, 200, 'Ad configuration updated', ad);
});

module.exports = { getAds, createAd, updateAd };
