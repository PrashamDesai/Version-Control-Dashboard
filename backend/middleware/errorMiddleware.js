const { errorResponse } = require('../utils/responseFormat');

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log the error for production monitoring
    console.error(`[ERROR] ${err.message}\n${err.stack}`);

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return errorResponse(res, 404, 'Resource not found');
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        return errorResponse(res, 400, 'Duplicate field value entered');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        return errorResponse(res, 400, message);
    }

    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
