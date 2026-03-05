const asyncHandler = require('../utils/asyncHandler');
const ClosedTestReport = require('../models/ClosedTestReport');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get closed test reports for game
// @route   GET /api/games/:gameId/closed-test
// @access  Private
const getReports = asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    const reports = await ClosedTestReport.find({ gameId }).sort('-createdAt');
    successResponse(res, 200, 'Reports fetched', reports);
});

// @desc    Create a closed test report
// @route   POST /api/games/:gameId/closed-test
// @access  Private/Admin
const createReport = asyncHandler(async (req, res) => {
    req.body.gameId = req.params.gameId;
    const report = await ClosedTestReport.create(req.body);
    successResponse(res, 201, 'Report created', report);
});

module.exports = { getReports, createReport };
