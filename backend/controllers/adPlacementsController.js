const AdPlacement = require('../models/AdPlacement');

// @desc    Get ad placements for a game
// @route   GET /api/games/:gameId/ad-placements
// @access  Private
const getAdPlacements = async (req, res) => {
    try {
        const adPlacements = await AdPlacement.find({ gameId: req.params.gameId });
        res.status(200).json({ success: true, count: adPlacements.length, data: adPlacements });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new ad placement
// @route   POST /api/games/:gameId/ad-placements
// @access  Private
const createAdPlacement = async (req, res) => {
    try {
        const { environment, platform, adType, placement, frequency, notes } = req.body;

        const adPlacement = await AdPlacement.create({
            gameId: req.params.gameId,
            environment,
            platform,
            adType,
            placement,
            frequency,
            notes,
        });

        res.status(201).json({ success: true, data: adPlacement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update an ad placement
// @route   PUT /api/games/:gameId/ad-placements/:id
// @access  Private
const updateAdPlacement = async (req, res) => {
    try {
        let adPlacement = await AdPlacement.findById(req.params.id);

        if (!adPlacement) {
            return res.status(404).json({ success: false, message: 'Ad placement not found' });
        }

        // Verify it belongs to the game
        if (adPlacement.gameId.toString() !== req.params.gameId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        adPlacement = await AdPlacement.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: adPlacement });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Delete an ad placement
// @route   DELETE /api/games/:gameId/ad-placements/:id
// @access  Private
const deleteAdPlacement = async (req, res) => {
    try {
        const adPlacement = await AdPlacement.findById(req.params.id);

        if (!adPlacement) {
            return res.status(404).json({ success: false, message: 'Ad placement not found' });
        }

        if (adPlacement.gameId.toString() !== req.params.gameId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await adPlacement.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAdPlacements,
    createAdPlacement,
    updateAdPlacement,
    deleteAdPlacement,
};
