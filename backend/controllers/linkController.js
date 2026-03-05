const asyncHandler = require('../utils/asyncHandler');
const Link = require('../models/Link');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get all links for a game
// @route   GET /api/games/:gameId/links
// @access  Private
const getLinks = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const links = await Link.find({ gameId }).sort('-createdAt');
    successResponse(res, 200, 'Links fetched successfully', links);
});

// @desc    Create a link
// @route   POST /api/games/:gameId/links
// @access  Private
const createLink = asyncHandler(async (req, res) => {
    req.body.gameId = req.params.gameId;
    const link = await Link.create(req.body);
    successResponse(res, 201, 'Link created successfully', link);
});

// @desc    Delete a link
// @route   DELETE /api/games/:gameId/links/:id
// @access  Private/Admin
const deleteLink = asyncHandler(async (req, res) => {
    const { gameId, id } = req.params;
    const link = await Link.findOneAndDelete({ _id: id, gameId });

    if (!link) {
        return errorResponse(res, 404, 'Link not found');
    }

    successResponse(res, 200, 'Link deleted successfully');
});

module.exports = {
    getLinks,
    createLink,
    deleteLink,
};
