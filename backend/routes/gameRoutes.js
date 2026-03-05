const express = require('express');
const router = express.Router();
const {
    getGames,
    getGameBySlug,
    createGame,
    updateGame,
    deleteGame,
    uploadIcon,
} = require('../controllers/gameController');

const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Nested routers
const releaseRouter = require('./releaseRoutes');
const environmentRouter = require('./environmentRoutes');
const adsRouter = require('./adsRoutes');
const checklistRouter = require('./checklistRoutes');
const storeRouter = require('./storeRoutes');
const closedTestRouter = require('./closedTestRoutes');
const linkRouter = require('./linkRoutes');

// Re-route to nested routers
router.use('/:gameId/releases', releaseRouter);
router.use('/:gameId/environments', environmentRouter);
router.use('/:gameId/ads', adsRouter);
router.use('/:gameId/checklist', checklistRouter);
router.use('/:gameId/store', storeRouter);
router.use('/:gameId/closed-test', closedTestRouter);
router.use('/:gameId/links', linkRouter);

// Main Game Routes
router.route('/')
    .get(protect, getGames)
    .post(protect, admin, createGame);

router.route('/slug/:slug')
    .get(protect, getGameBySlug);

router.route('/:id')
    .put(protect, admin, updateGame)
    .delete(protect, admin, deleteGame);

router.route('/:id/upload-icon')
    .post(protect, admin, upload.single('icon'), uploadIcon);

module.exports = router;
