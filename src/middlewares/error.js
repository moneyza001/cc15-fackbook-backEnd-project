module.exports = (err, req, res, next) => {
    console.log(err);
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
        err.statusCode = 401;
    }

    if (err.name === "ValidationError") {
        err.statusCode = 400;
    }

    res.status(err.statusCode || 500).json({ message: err.message });
};
