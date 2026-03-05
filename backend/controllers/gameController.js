const asyncHandler = require('../utils/asyncHandler');
const Game = require('../models/Game');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get all games
// @route   GET /api/games
// @access  Private
const getGames = asyncHandler(async (req, res) => {
    const games = await Game.find().sort('-createdAt');
    successResponse(res, 200, 'Games fetched successfully', games);
});

// @desc    Get game by slug
// @route   GET /api/games/slug/:slug
// @access  Private
const getGameBySlug = asyncHandler(async (req, res) => {
    const game = await Game.findOne({ slug: req.params.slug });
    if (!game) {
        return errorResponse(res, 404, 'Game not found');
    }
    successResponse(res, 200, 'Game fetched successfully', game);
});

// @desc    Create a new game
// @route   POST /api/games
// @access  Private/Admin
const createGame = asyncHandler(async (req, res) => {
    const gameExists = await Game.findOne({ name: req.body.name });

    if (gameExists) {
        return errorResponse(res, 400, 'Game with this name already exists');
    }

    const game = await Game.create(req.body);
    successResponse(res, 201, 'Game created successfully', game);
});

// @desc    Update game details
// @route   PUT /api/games/:id
// @access  Private/Admin
const updateGame = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);

    if (!game) {
        return errorResponse(res, 404, 'Game not found');
    }

    // if name changed, update Name (slugify hook handles the rest)
    if (req.body.name) game.name = req.body.name;
    if (req.body.description !== undefined) game.description = req.body.description;
    if (req.body.platformsSupported) game.platformsSupported = req.body.platformsSupported;
    if (req.body.isActive !== undefined) game.isActive = req.body.isActive;
    if (req.body.status !== undefined) game.status = req.body.status;
    if (req.body.playStoreUrl !== undefined) game.playStoreUrl = req.body.playStoreUrl;
    if (req.body.appStoreUrl !== undefined) game.appStoreUrl = req.body.appStoreUrl;

    const updatedGame = await game.save();

    successResponse(res, 200, 'Game updated successfully', updatedGame);
});

// @desc    Delete a game (and cascade delete data)
// @route   DELETE /api/games/:id
// @access  Private/Admin
const deleteGame = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);

    if (!game) {
        return errorResponse(res, 404, 'Game not found');
    }

    // Triggers mongoose 'deleteOne' middleware for cascading
    await game.deleteOne();

    successResponse(res, 200, 'Game and all associated data deleted successfully');
});

// @desc    Upload Game Icon
// @route   POST /api/games/:id/upload-icon
// @access  Private/Admin
const uploadIcon = asyncHandler(async (req, res) => {
    const game = await Game.findById(req.params.id);

    if (!game) {
        return errorResponse(res, 404, 'Game not found');
    }

    if (!req.file) {
        return errorResponse(res, 400, 'Please upload a valid image file');
    }

    // Save relative path
    const iconUrl = `/uploads/games/${req.file.filename}`;
    game.iconUrl = iconUrl;
    await game.save();

    successResponse(res, 200, 'Icon uploaded successfully', {
        iconUrl,
        game
    });
});

module.exports = {
    getGames,
    getGameBySlug,
    createGame,
    updateGame,
    deleteGame,
    uploadIcon,
};
