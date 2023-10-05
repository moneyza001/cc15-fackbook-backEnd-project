const fs = require("fs/promises");

const createError = require("../utils/createError");
const { upload } = require("../utils/cloudinayService");
const prisma = require("../model/prisma");
const { checkUserIdSchema } = require("../validators/userValidater");

exports.updateProfile = async (req, res, next) => {
    //promise.all *******************
    try {
        if (!req.files) {
            return next(createError("profile image or cover image is require"));
        }
        const response = {};
        if (req.files.profileImage) {
            const url = await upload(req.files.profileImage[0].path);
            response.profileImage = url;
            await prisma.user.update({
                data: {
                    profileImage: url,
                },
                where: {
                    id: req.user.id,
                },
            });
        }
        if (req.files.coverImage) {
            const url = await upload(req.files.coverImage[0].path);
            response.coverImage = url;
            await prisma.user.update({
                data: {
                    coverImage: url,
                },
                where: {
                    id: req.user.id,
                },
            });
        }

        res.status(200).json(response);
    } catch (error) {
        next(error);
    } finally {
        if (req.files.profileImage) {
            fs.unlink(req.files.profileImage[0].path);
        }
        if (req.files.coverImage) {
            fs.unlink(req.files.coverImage[0].path);
        }
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const { error } = checkUserIdSchema.validate(req.params);
        console.log(req.params);
        if (error) {
            return next(error);
        }
        const userId = +req.params.userId;
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (user) {
            delete user.password;
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};
