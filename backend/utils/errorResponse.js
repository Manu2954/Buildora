class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message); // Call the parent constructor (Error) with the message
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;