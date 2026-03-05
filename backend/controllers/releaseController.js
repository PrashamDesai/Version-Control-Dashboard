const asyncHandler = require('../utils/asyncHandler');
const Release = require('../models/Release');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get all releases for a game
// @route   GET /api/games/:gameId/releases
// @access  Private
const getReleases = asyncHandler(async (req, res) => {
    const { platform, status, search, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    const { gameId } = req.params;

    const query = { gameId, softDelete: false };
    if (platform) query.platform = platform;
    if (status) query.status = status;
    if (search) query.versionName = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const releases = await Release.find(query)
        .sort(sort)
        .skip(Number(skip))
        .limit(Number(limit));

    const total = await Release.countDocuments(query);

    successResponse(res, 200, 'Releases fetched successfully', {
        releases,
        page: Number(page),
        pages: Math.ceil(total / limit),
        total,
    });
});

// @desc    Create a release for a game
// @route   POST /api/games/:gameId/releases
// @access  Private
const createRelease = asyncHandler(async (req, res) => {
    req.body.gameId = req.params.gameId; // Tie to game

    if (!req.body.releaseNumber) {
        const lastRelease = await Release.findOne({ gameId: req.params.gameId }).sort('-releaseNumber');
        req.body.releaseNumber = lastRelease && lastRelease.releaseNumber ? lastRelease.releaseNumber + 1 : 1;
    }

    if (!req.body.releaseDate) {
        req.body.releaseDate = new Date();
    }

    const release = await Release.create(req.body);
    successResponse(res, 201, 'Release created successfully', release);
});

// @desc    Update a release
// @route   PUT /api/games/:gameId/releases/:id
// @access  Private/Admin
const updateRelease = asyncHandler(async (req, res) => {
    const { id, gameId } = req.params;
    const release = await Release.findOne({ _id: id, gameId });

    if (!release || release.softDelete) {
        return errorResponse(res, 404, 'Release not found');
    }

    const updatedRelease = await Release.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    successResponse(res, 200, 'Release updated', updatedRelease);
});

// @desc    Delete a release (soft)
// @route   DELETE /api/games/:gameId/releases/:id
// @access  Private/Admin
const deleteRelease = asyncHandler(async (req, res) => {
    const { id, gameId } = req.params;
    const release = await Release.findOne({ _id: id, gameId });

    if (!release || release.softDelete) {
        return errorResponse(res, 404, 'Release not found');
    }

    release.softDelete = true;
    await release.save();

    successResponse(res, 200, 'Release deleted successfully (soft delete)');
});

module.exports = {
    getReleases,
    createRelease,
    updateRelease,
    deleteRelease,
};
