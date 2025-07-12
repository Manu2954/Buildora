const asyncHandler = fn => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch(next); // Pass any errors to the next middleware (our error handler)

module.exports = asyncHandler;
