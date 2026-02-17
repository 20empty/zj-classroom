/**
 * Standard API Response Formatter
 */
const successResponse = (res, data, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, error, statusCode = 500) => {
    const message = error.message || error || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
    });
};

module.exports = {
    successResponse,
    errorResponse
};
