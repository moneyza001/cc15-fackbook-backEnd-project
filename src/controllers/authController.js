const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/auth-validator");
const prisma = require("../model/prisma");
const createError = require("../utils/createError");

exports.register = async (req, res, next) => {
    try {
        const { value, error } = registerSchema.validate(req.body);
        if (error) {
            return next(error);
        }
        value.password = await bcrypt.hash(value.password, 12);
        const user = await prisma.user.create({
            data: value,
        });
        const playload = { userId: user.id };
        const accessToken = jwt.sign(
            playload,
            process.env.JWT_SECRET_KEY || "vwe5b32523mrlkqmblkerre",
            { expiresIn: process.env.JWT_EXPIRE }
        );
        res.status(201).json({ accessToken });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { value, error } = loginSchema.validate(req.body);
        console.log("value", value);
        if (error) {
            error.statusCode = 400;
            return next(error);
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: value.emailOrMobile },
                    { mobile: value.emailOrMobile },
                ],
            },
        });
        if (!user) {
            return next(createError("Invalid creadential", 400));
        }
        const isMatch = await bcrypt.compare(value.password, user.password);
        if (!isMatch) {
            return next(createError("Invalid creadential", 400));
        }
        const playload = { userId: user.id };
        const accessToken = jwt.sign(
            playload,
            process.env.JWT_SECRET_KEY || "vwe5b32523mrlkqmblkerre",
            { expiresIn: process.env.JWT_EXPIRE }
        );
        res.status(200).json({ accessToken });
    } catch (error) {
        next(error);
    }
};
