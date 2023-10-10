const fs = require("fs/promises");
const createError = require("../utils/createError");
const { upload } = require("../utils/cloudinayService");
const prisma = require("../model/prisma");
const { STATUS_ACCEPTED } = require("../config/constant");
const { checkPostIdSchema } = require("../validators/postValidator");

const getFriendId = async (targetUserId) => {
    const reletionship = await prisma.friend.findMany({
        where: {
            OR: [{ receiverId: targetUserId }, { requesterId: targetUserId }],
            status: STATUS_ACCEPTED,
        },
    });
    const friendId = reletionship.map((el) =>
        el.requesterId === targetUserId ? el.receiverId : el.requesterId
    );
    return friendId;
};

exports.createPost = async (req, res, next) => {
    try {
        const { message } = req.body;

        if ((!message || !message.trim()) && !req.file) {
            return next(createError("message or image is require", 400));
        }

        const data = { userId: req.user.id };
        if (req.file) {
            data.image = await upload(req.file.path);
        }
        if (message) {
            data.message = message;
        }

        const post = await prisma.post.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        res.status(201).json({ message: "post crated", post });
    } catch (error) {
        next(error);
    } finally {
        if (req.file) {
            fs.unlink(req.file.path);
        }
    }
};

exports.getAllPostIcludeFriendPost = async (req, res, next) => {
    try {
        const friendId = await getFriendId(req.user.id);
        const posts = await prisma.post.findMany({
            where: {
                userId: {
                    in: [...friendId, req.user.id],
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true,
                    },
                },
                likes: {
                    select: {
                        userId: true,
                    },
                },
            },
        });
        res.status(200).json({ posts });
    } catch (error) {
        next(error);
    }
};

exports.deletePost = async (req, res, next) => {
    try {
        const { value, error } = checkPostIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
        const existPost = await prisma.post.findFirst({
            where: {
                id: value.postId,
                userId: req.user.id,
            },
        });
        if (!existPost) {
            return next(createError("Can not delete this post", 400));
        }

        await prisma.post.delete({
            where: {
                id: existPost.id,
            },
        });
        res.status(200).json({ message: "deleted" });
    } catch (error) {
        next(error);
    }
};
