const fs = require("fs/promises");

const createError = require("../utils/createError");
const { upload } = require("../utils/cloudinayService");
const prisma = require("../model/prisma");

exports.updateProflie = async (req, res, next) => {
    try {
        if (!req.files) {
            return next(createError("profile image or cover image is require"));
        }
        if (req.files.profileImage) {
            const url = await upload(req.files.profileImage[0].path);
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
            await prisma.user.update({
                data: {
                    coverImage: url,
                },
                where: {
                    id: req.user.id,
                },
            });
        }

        res.status(200).json({ message: "Update Image Success" });
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
