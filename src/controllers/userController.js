const fs = require("fs/promises");

const createError = require("../utils/createError");
const { upload } = require("../utils/cloudinayService");
const prisma = require("../model/prisma");
const { checkUserIdSchema } = require("../validators/userValidater");
const {
    AUTH_USER,
    UNKNOW,
    STATUS_ACCEPTED,
    FRIEND,
    REQUESTER,
    RECEIVER,
} = require("../config/constant");

const getTargetUserStatusWithAythUserId = async (targetUserId, authUserId) => {
    if (targetUserId === authUserId) {
        return AUTH_USER;
    }
    const relationship = await prisma.friend.findFirst({
        where: {
            OR: [
                { requesterId: targetUserId, receiverId: authUserId },
                { requesterId: authUserId, receiverId: targetUserId },
            ],
        },
    });
    if (!relationship) {
        return UNKNOW;
    }
    if (relationship.status === STATUS_ACCEPTED) {
        return FRIEND;
    }
    if (relationship.requesterId === authUserId) {
        return REQUESTER;
    }

    return RECEIVER;
};

const getTargetUserFriend = async (targetUserId) => {
    const relationships = await prisma.friend.findMany({
        where: {
            status: STATUS_ACCEPTED,
            OR: [{ receiverId: targetUserId }, { requesterId: targetUserId }],
        },
        select: {
            requester: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    mobile: true,
                    profileImage: true,
                    coverImage: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    mobile: true,
                    profileImage: true,
                    coverImage: true,
                },
            },
        },
    });
    const friends = relationships.map((el) =>
        el.requester.id === targetUserId ? el.receiver : el.requester
    );
    return friends;
};

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
        let status = null;
        let friends = null;
        if (user) {
            delete user.password;
            status = await getTargetUserStatusWithAythUserId(
                userId,
                req.user.id
            );
            friends = await getTargetUserFriend(userId);
        }

        res.status(200).json({ user, status, friends });
    } catch (error) {
        next(error);
    }
};
