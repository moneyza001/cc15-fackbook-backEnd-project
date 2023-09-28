const { rateLimit } = require("express-rate-limit");

module.exports = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 100,
    message: { message: "Too Many Request From This IP" },
});
