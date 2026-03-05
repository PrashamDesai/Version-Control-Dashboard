const asyncHandler = require('../utils/asyncHandler');
const TeamMember = require('../models/TeamMember');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseFormat');
const path = require('path');

// @desc    Get all team members
// @route   GET /api/team
// @access  Private (all authenticated users)
const getTeamMembers = asyncHandler(async (req, res) => {
    const members = await TeamMember.find().sort({ order: 1, createdAt: -1 });

    // Attach "isLoggedIn" flag when a member's linkedUserId matches requesting user
    const enriched = members.map(m => ({
        ...m.toObject(),
        isCurrentUser: m.linkedUserId
            ? m.linkedUserId.toString() === req.user._id.toString()
            : false,
    }));

    successResponse(res, 200, 'Team members fetched', enriched);
});

// @desc    Create a team member
// @route   POST /api/team
// @access  Admin / Super Admin
const createTeamMember = asyncHandler(async (req, res) => {
    const { name, role, email, phone, linkedUserId, order } = req.body;
    if (!name) return errorResponse(res, 400, 'Name is required');

    const photoUrl = req.file ? `/uploads/team/${req.file.filename}` : undefined;

    const member = await TeamMember.create({
        name,
        role,
        email,
        phone,
        ...(photoUrl && { photoUrl }),
        ...(linkedUserId && { linkedUserId }),
        ...(order !== undefined && { order }),
    });

    successResponse(res, 201, 'Team member created', member);
});

// @desc    Update a team member
// @route   PATCH /api/team/:id
// @access  Admin / Super Admin
const updateTeamMember = asyncHandler(async (req, res) => {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return errorResponse(res, 404, 'Team member not found');

    const { name, role, email, phone, linkedUserId, order } = req.body;
    if (name !== undefined) member.name = name;
    if (role !== undefined) member.role = role;
    if (email !== undefined) member.email = email;
    if (phone !== undefined) member.phone = phone;
    if (linkedUserId !== undefined) member.linkedUserId = linkedUserId || null;
    if (order !== undefined) member.order = order;
    if (req.file) member.photoUrl = `/uploads/team/${req.file.filename}`;

    await member.save();
    successResponse(res, 200, 'Team member updated', member);
});

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Admin / Super Admin
const deleteTeamMember = asyncHandler(async (req, res) => {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return errorResponse(res, 404, 'Team member not found');
    successResponse(res, 200, 'Team member deleted', {});
});

module.exports = { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember };
