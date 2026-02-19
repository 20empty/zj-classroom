class Response {
    constructor(success, data, message, statusCode = 200) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
    }

    static success(res, data, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json(new Response(true, data, message, statusCode));
    }

    static error(res, message = 'Error', statusCode = 500, error = null) {
        if (error && process.env.NODE_ENV !== 'production') {
            console.error(error); // Or use logger.error(error) if imported
        }
        return res.status(statusCode).json(new Response(false, null, message, statusCode));
    }
}

module.exports = Response;
