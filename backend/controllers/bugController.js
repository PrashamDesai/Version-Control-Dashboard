const asyncHandler = require('../utils/asyncHandler');
const Bug = require('../models/Bug');
const Game = require('../models/Game');
const { successResponse, errorResponse } = require('../utils/responseFormat');
const { notifyBugAssigned } = require('../utils/notificationService');

// @desc    Get all bugs for a game
// @route   GET /api/games/:gameId/bugs
// @access  Private
const getBugs = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const bugs = await Bug.find({ gameId })
        .populate('assignedTo', 'name role photoUrl email phone')
        .populate('assignedBy', 'name email phone avatarUrl')
        .sort({ createdAt: -1 });
    successResponse(res, 200, 'Bugs fetched', bugs);
});

const Image = require('../models/Image');

// @desc    Create a bug report
// @route   POST /api/games/:gameId/bugs
// @access  Private (any authenticated user)
const createBug = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const { title, where, how, frequency, assignedTo } = req.body;

    if (!title) return errorResponse(res, 400, 'Title is required');
    if (!frequency) return errorResponse(res, 400, 'Frequency is required');
    if (!assignedTo) return errorResponse(res, 400, 'You must assign the bug to a team member');

    // Build media array from uploaded files by saving them to MongoDB Image collection
    let media = [];
    if (req.files && req.files.length > 0) {
        const imageDocs = await Promise.all(
            req.files.map(file => Image.create({
                filename: file.originalname,
                contentType: file.mimetype,
                data: file.buffer
            }))
        );
        media = imageDocs.map((doc, index) => ({
            url: `/api/images/${doc._id}`,
            type: req.files[index].mimetype.startsWith('video/') ? 'video' : 'image',
        }));
    }

    const bug = await Bug.create({
        gameId,
        title,
        where: where || '',
        how: how || '',
        frequency,
        media,
        assignedTo,
        assignedBy: req.user._id,
    });

    // Return populated doc
    const populated = await Bug.findById(bug._id)
        .populate('assignedTo', 'name role photoUrl email phone')
        .populate('assignedBy', 'name email phone avatarUrl');

    successResponse(res, 201, 'Bug reported', populated);

    // Send notification after responding so the user isn't kept waiting
    if (populated.assignedTo) {
        const game = await Game.findById(gameId).select('name slug').lean();
        notifyBugAssigned({
            teamMember: populated.assignedTo,
            gameName: game?.name || 'Unknown Game',
            gameSlug: game?.slug,
            reportedBy: populated.assignedBy?.name || 'A team member',
            bug: populated,
        });
    }
});

// @desc    Update bug status or assignment
// @route   PATCH /api/games/:gameId/bugs/:id
// @access  Private
const updateBug = asyncHandler(async (req, res) => {
    const bug = await Bug.findOne({ _id: req.params.id, gameId: req.params.gameId });
    if (!bug) return errorResponse(res, 404, 'Bug not found');

    const { title, where, how, frequency, status, assignedTo } = req.body;

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isReporter = String(bug.assignedBy) === String(req.user._id);
    const isAssignee = String(bug.assignedTo) === String(req.user._id);

    // Permission check for modifying core bug details
    const attemptingCoreEdit = title !== undefined || where !== undefined || how !== undefined || frequency !== undefined || assignedTo !== undefined || req.files?.length;
    if (attemptingCoreEdit && !isAdmin && !isReporter) {
        return errorResponse(res, 403, 'You do not have permission to edit this bug report');
    }

    // Permission check for modifying status
    const attemptingStatusEdit = status !== undefined && status !== bug.status;
    if (attemptingStatusEdit && !isAdmin && !isAssignee) {
        return errorResponse(res, 403, 'Only the assigned team member or an admin can update the bug status');
    }

    // Track if assignee is changing so we know whether to notify
    const prevAssignedTo = bug.assignedTo?.toString();
    const newAssignedTo = assignedTo !== undefined ? (assignedTo || null) : prevAssignedTo;
    const assigneeChanged = assignedTo !== undefined && String(newAssignedTo) !== String(prevAssignedTo || '');

    if (title !== undefined) bug.title = title;
    if (where !== undefined) bug.where = where;
    if (how !== undefined) bug.how = how;
    if (frequency !== undefined) bug.frequency = frequency;
    if (status !== undefined) bug.status = status;
    if (assignedTo !== undefined && assignedTo !== '') bug.assignedTo = assignedTo;

    // Append any new uploaded media
    if (req.files?.length) {
        const imageDocs = await Promise.all(
            req.files.map(file => Image.create({
                filename: file.originalname,
                contentType: file.mimetype,
                data: file.buffer
            }))
        );
        const newMedia = imageDocs.map((doc, index) => ({
            url: `/api/images/${doc._id}`,
            type: req.files[index].mimetype.startsWith('video/') ? 'video' : 'image',
        }));
        bug.media.push(...newMedia);
    }

    await bug.save();
    const populated = await Bug.findById(bug._id)
        .populate('assignedTo', 'name role photoUrl email phone')
        .populate('assignedBy', 'name email phone avatarUrl');

    successResponse(res, 200, 'Bug updated', populated);

    // Notify new assignee if the assignee changed and is not null
    if (assigneeChanged && populated.assignedTo) {
        const game = await Game.findById(req.params.gameId).select('name slug').lean();
        notifyBugAssigned({
            teamMember: populated.assignedTo,
            gameName: game?.name || 'Unknown Game',
            gameSlug: game?.slug,
            reportedBy: populated.assignedBy?.name || 'A team member',
            bug: populated,
        });
    }
});

// @desc    Delete a bug report
// @route   DELETE /api/games/:gameId/bugs/:id
// @access  Private
const deleteBug = asyncHandler(async (req, res) => {
    const bug = await Bug.findOneAndDelete({ _id: req.params.id, gameId: req.params.gameId });
    if (!bug) return errorResponse(res, 404, 'Bug not found');
    successResponse(res, 200, 'Bug deleted', {});
});

module.exports = { getBugs, createBug, updateBug, deleteBug };
