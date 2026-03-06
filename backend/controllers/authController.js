const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/responseFormat');
const { OAuth2Client } = require('google-auth-library');

// We use the GOOGLE_CLIENT_ID from environment, or a dummy string for local dev if not provided yet.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_for_dev');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!email) return errorResponse(res, 400, 'Email is required');
    if (!password) return errorResponse(res, 400, 'Password is required');

    // Check if user exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
        return errorResponse(res, 400, 'User already exists with this email');
    }

    // Assign super_admin if it's the first user ever
    const userCount = await User.countDocuments({});
    const assignedRole = userCount === 0 ? 'super_admin' : 'user';

    const user = await User.create({ name, email, password, role: assignedRole });

    if (user) {
        successResponse(res, 201, 'User registered successfully', {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        errorResponse(res, 400, 'Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return errorResponse(res, 400, 'Please provide credentials');
    }

    const user = await User.findOne({ email, isDeleted: { $ne: true } });

    if (user && (await user.matchPassword(password))) {
        successResponse(res, 200, 'Login successful', {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        errorResponse(res, 401, 'Invalid credentials');
    }
});

// @desc    Auth with Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return errorResponse(res, 400, 'No Google credential provided');
    }

    try {
        // Verify the token from Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const { sub: googleId, email, name, picture: avatarUrl } = payload;

        // Find user by Google ID or Email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // If user exists but doesn't have googleId linked, link it now
            if (!user.googleId) {
                user.googleId = googleId;
                user.avatarUrl = avatarUrl || user.avatarUrl;
                await user.save();
            }
        } else {
            // Assign super_admin if it's the first user ever
            const userCount = await User.countDocuments({});
            const assignedRole = userCount === 0 ? 'super_admin' : 'user';

            // Create a new user with default 'user' role
            user = await User.create({
                name,
                email,
                googleId,
                avatarUrl,
                role: assignedRole
            });
        }

        successResponse(res, 200, 'Google Login successful', {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        errorResponse(res, 401, 'Invalid Google Token or Verification Failed');
    }
});


// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return errorResponse(res, 404, 'User not found');
    successResponse(res, 200, 'User profile', {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
    });
});

const Image = require('../models/Image');

// @desc    Update profile (phone, avatar)
// @route   PATCH /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, 404, 'User not found');

    const { name, avatarUrl } = req.body;

    // Update name
    if (name) user.name = name;

    // Avatar: uploaded file takes priority, else accept a URL string
    if (req.file) {
        const imageDoc = await Image.create({
            filename: req.file.originalname,
            contentType: req.file.mimetype,
            data: req.file.buffer
        });
        user.avatarUrl = `/api/images/${imageDoc._id}`;
    } else if (avatarUrl !== undefined) {
        user.avatarUrl = avatarUrl;
    }

    await user.save();

    successResponse(res, 200, 'Profile updated', {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
    });
});

// @desc    Delete user account
// @route   DELETE /api/auth/delete
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        return errorResponse(res, 404, 'User not found');
    }

    await User.deleteOne({ _id: user._id });
    successResponse(res, 200, 'User deleted successfully', {});
});

module.exports = {
    registerUser,
    loginUser,
    googleAuth,
    getMe,
    updateProfile,
    deleteAccount,
};
