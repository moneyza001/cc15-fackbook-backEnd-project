const createError = require("../utils/createError");
const jwt = require("jsonwebtoken");
const prisma = require("../model/prisma");

module.exports = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return next(createError("unathenticate", 401));
        }
        const token = authorization.split(" ")[1];
        const playload = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY || "nkwefnlkn23rlf32"
        );
        const user = await prisma.user.findUnique({
            where: {
                id: playload.userId,
            },
        });
        if (!user) {
            return next(createError("unathenticate", 401));
        }
        delete user.password;
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};
