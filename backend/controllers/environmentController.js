const asyncHandler = require('../utils/asyncHandler');
const EnvironmentConfig = require('../models/EnvironmentConfig');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get all environment configs for a game
// @route   GET /api/games/:gameId/environments
// @access  Private
const getEnvironments = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const environments = await EnvironmentConfig.find({ gameId });
    successResponse(res, 200, 'Environments fetched successfully', environments);
});

// @desc    Update or create environment config
// @route   PUT /api/games/:gameId/environments/:environment
// @access  Private/Admin
const updateEnvironment = asyncHandler(async (req, res) => {
    const { gameId, environment } = req.params;

    // Ensure body has gameId set correctly for upsert
    req.body.gameId = gameId;
    console.log('DEBUG BACKEND: Request Body:', JSON.stringify(req.body, null, 2));

    const updatedEnv = await EnvironmentConfig.findOneAndUpdate(
        { gameId, environment: environment.toUpperCase() },
        req.body,
        { new: true, runValidators: true, upsert: true }
    );

    console.log('DEBUG BACKEND: Updated Doc:', JSON.stringify(updatedEnv, null, 2));

    successResponse(res, 200, 'Environment config updated', updatedEnv);
});

module.exports = {
    getEnvironments,
    updateEnvironment,
};
