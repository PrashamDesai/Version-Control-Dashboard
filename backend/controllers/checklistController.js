const asyncHandler = require('../utils/asyncHandler');
const BuildChecklist = require('../models/BuildChecklist');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get checklist items for a game
// @route   GET /api/games/:gameId/checklist
// @access  Private
const getChecklist = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const checklist = await BuildChecklist.find({ gameId });
    successResponse(res, 200, 'Checklist fetched', checklist);
});

// @desc    Update or Create a checklist item
// @route   PUT /api/games/:gameId/checklist/:id? (or POST for new) Let's assume you pass ID to generic update or just POST
// @access  Private/Admin
const updateChecklist = asyncHandler(async (req, res) => {
    const { gameId, id } = req.params;
    const item = await BuildChecklist.findOneAndUpdate(
        { _id: id, gameId },
        req.body,
        { new: true, runValidators: true }
    );

    if (!item) return errorResponse(res, 404, 'Checklist item not found');

    successResponse(res, 200, 'Checklist item updated', item);
});

const createChecklist = asyncHandler(async (req, res) => {
    req.body.gameId = req.params.gameId;
    const item = await BuildChecklist.create(req.body);
    successResponse(res, 201, 'Checklist item created', item);
});

const deleteChecklist = asyncHandler(async (req, res) => {
    const { gameId, id } = req.params;
    const item = await BuildChecklist.findOneAndDelete({ _id: id, gameId });

    if (!item) return errorResponse(res, 404, 'Checklist item not found');

    successResponse(res, 200, 'Checklist item deleted', {});
});

module.exports = { getChecklist, updateChecklist, createChecklist, deleteChecklist };
