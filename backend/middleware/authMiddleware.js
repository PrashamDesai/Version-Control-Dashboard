const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseFormat');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return errorResponse(res, 401, 'Not authorized, token failed');
        }
    }

    if (!token) {
        return errorResponse(res, 401, 'Not authorized, no token');
    }
});

// Middleware: only admin or super_admin can proceed
const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        return errorResponse(res, 403, 'Not authorized as an admin');
    }
};

// Middleware: only super_admin can proceed
const superAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        return errorResponse(res, 403, 'Not authorized as super admin');
    }
};

module.exports = { protect, admin, superAdmin };

