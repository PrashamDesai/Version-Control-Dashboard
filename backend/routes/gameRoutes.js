const express = require('express');
const router = express.Router();
const {
    getGames,
    getGameBySlug,
    createGame,
    updateGame,
    deleteGame,
    uploadIcon,
    uploadScreenshots,
    deleteScreenshot
} = require('../controllers/gameController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * --- 1. GENERAL GAME ROUTES (No ID required) ---
 */
router.get('/', protect, getGames);
router.post('/', protect, admin, createGame);
router.get('/slug/:slug', protect, getGameBySlug);

/**
 * --- 2. GAME SPECIFIC CONTENT ROUTER ---
 * Mounted at /api/games/:gameId
 */
const gameSpecificRouter = express.Router({ mergeParams: true });

// Middleware to map :gameId to :id for controllers that use req.params.id
const mapId = (req, res, next) => {
    req.params.id = req.params.gameId;
    next();
};

// Nested Resource Routes
gameSpecificRouter.use('/releases', require('./releaseRoutes'));
gameSpecificRouter.use('/environments', require('./environmentRoutes'));
gameSpecificRouter.use('/ads', require('./adsRoutes'));
gameSpecificRouter.use('/checklist', require('./checklistRoutes'));
gameSpecificRouter.use('/store', require('./storeRoutes'));
gameSpecificRouter.use('/closed-test', require('./closedTestRoutes'));
gameSpecificRouter.use('/links', require('./linkRoutes'));
gameSpecificRouter.use('/firestore-rules', require('./firestoreRulesRoutes'));
gameSpecificRouter.use('/bugs', require('./bugRoutes'));
gameSpecificRouter.use('/ad-placements', require('./adPlacementsRoutes'));

// Game Identity / Root CRUD for the specific game
gameSpecificRouter.route('/')
    .put(protect, admin, mapId, updateGame)
    .delete(protect, admin, mapId, deleteGame);

// Asset Management for specific game
gameSpecificRouter.post('/upload-icon', protect, admin, mapId, upload.single('icon'), uploadIcon);
gameSpecificRouter.post('/upload-screenshots/:platform', protect, admin, mapId, upload.array('screenshots', 10), uploadScreenshots);
gameSpecificRouter.delete('/delete-screenshot/:platform', protect, admin, mapId, deleteScreenshot);

// Mount the specific router
router.use('/:gameId', gameSpecificRouter);

module.exports = router;
