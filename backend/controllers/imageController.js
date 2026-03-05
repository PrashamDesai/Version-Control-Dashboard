const asyncHandler = require('../utils/asyncHandler');
const Image = require('../models/Image');
const { errorResponse } = require('../utils/responseFormat');

// @desc    Get image by ID
// @route   GET /api/images/:id
// @access  Public
const getImage = asyncHandler(async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).send('Image not found');
        }

        res.set('Content-Type', image.contentType);
        res.set('Cache-Control', 'public, max-age=31557600'); // Cache for 1 year
        res.send(image.data);
    } catch (error) {
        // Fallback for invalid ObjectIDs or other DB errors
        res.status(404).send('Image not found');
    }
});

module.exports = {
    getImage
};
