const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseFormat');

// @desc    Get all non-deleted users
// @route   GET /api/admin/users
// @access  Admin / Super Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ isDeleted: { $ne: true } })
        .select('-password')
        .sort({ createdAt: -1 });
    successResponse(res, 200, 'Users fetched', users);
});

// @desc    Update a user's role (super_admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Super Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const allowed = ['user', 'admin', 'super_admin'];

    if (!allowed.includes(role)) {
        return errorResponse(res, 400, 'Invalid role');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) return errorResponse(res, 404, 'User not found');

    successResponse(res, 200, 'Role updated', user);
});

// @desc    Soft-delete a user account (super_admin only)
// @route   DELETE /api/admin/users/:id
// @access  Super Admin
const deleteUser = asyncHandler(async (req, res) => {
    // Prevent super_admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
        return errorResponse(res, 400, 'Cannot delete your own account');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
    ).select('-password');

    if (!user) return errorResponse(res, 404, 'User not found');

    successResponse(res, 200, 'User deleted', {});
});

module.exports = { getAllUsers, updateUserRole, deleteUser };
