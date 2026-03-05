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

const Image = require('../models/Image');

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

    // Save image buffer to DB
    const imageDoc = await Image.create({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        data: req.file.buffer
    });

    const iconUrl = `/api/images/${imageDoc._id}`;
    game.iconUrl = iconUrl;
    await game.save();

    successResponse(res, 200, 'Icon uploaded successfully', {
        iconUrl,
        game
    });
});

// @desc    Upload Game Screenshots
// @route   POST /api/games/:id/screenshots/:platform
// @access  Private/Admin
const uploadScreenshots = asyncHandler(async (req, res) => {
    const { id, platform } = req.params;
    console.log(`[DEBUG] Screenshot Upload - GameID: ${id}, Platform: ${platform}`);

    const game = await Game.findById(id);

    if (!game) {
        console.log(`[DEBUG] Game not found with ID: ${id}`);
        return errorResponse(res, 404, `Game not found with ID: ${id}`);
    }

    if (!['android', 'ios'].includes(platform.toLowerCase())) {
        return errorResponse(res, 400, 'Invalid platform. Must be android or ios.');
    }

    if (!req.files || req.files.length === 0) {
        return errorResponse(res, 400, 'Please upload at least one image file');
    }

    const field = platform.toLowerCase() === 'android' ? 'androidScreenshots' : 'iosScreenshots';

    // Save image buffers to DB
    const imageDocs = await Promise.all(
        req.files.map(file => Image.create({
            filename: file.originalname,
            contentType: file.mimetype,
            data: file.buffer
        }))
    );

    const newScreenshots = imageDocs.map(doc => `/api/images/${doc._id}`);

    game[field] = [...(game[field] || []), ...newScreenshots];
    await game.save();

    successResponse(res, 200, `${platform} screenshots uploaded successfully`, {
        screenshots: game[field],
        game
    });
});

// @desc    Delete a screenshot
// @route   DELETE /api/games/:id/screenshots/:platform
// @access  Private/Admin
const deleteScreenshot = asyncHandler(async (req, res) => {
    const { platform } = req.params;
    const { screenshotUrl } = req.body;
    console.log(`[DEBUG] Screenshot Delete - GameID: ${req.params.id}, Platform: ${platform}, URL: ${screenshotUrl}`);
    const game = await Game.findById(req.params.id);

    if (!game) {
        return errorResponse(res, 404, 'Game not found');
    }

    if (!['android', 'ios'].includes(platform.toLowerCase())) {
        return errorResponse(res, 400, 'Invalid platform');
    }

    if (!screenshotUrl) {
        return errorResponse(res, 400, 'screenshotUrl is required');
    }

    const field = platform.toLowerCase() === 'android' ? 'androidScreenshots' : 'iosScreenshots';
    game[field] = game[field].filter(url => url !== screenshotUrl);
    await game.save();

    successResponse(res, 200, 'Screenshot deleted successfully', game[field]);
});

module.exports = {
    getGames,
    getGameBySlug,
    createGame,
    updateGame,
    deleteGame,
    uploadIcon,
    uploadScreenshots,
    deleteScreenshot,
};
