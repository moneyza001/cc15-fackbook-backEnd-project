const { STATUS_PENDING, STATUS_ACCEPTED } = require("../config/constant");
const prisma = require("../model/prisma");
const createError = require("../utils/createError");
const {
    checkReceiverIdSchema,
    checkRequesterIdSchema,
    checkFriendIdSchema,
} = require("../validators/userValidater");

exports.requestFriend = async (req, res, next) => {
    try {
        const { error, value } = checkReceiverIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
        if (value.receiverId === req.user.id) {
            return next(createError("Can not request yourself", 400));
        }

        const targetUser = await prisma.user.findUnique({
            where: {
                id: value.receiverId,
            },
        });

        if (!targetUser) {
            return next(createError("User dose not exist", 400));
        }

        const existRelationship = await prisma.friend.findFirst({
            where: {
                OR: [
                    {
                        requesterId: req.user.id,
                        receiverId: value.receiverId,
                    },
                    {
                        requesterId: value.receiverId,
                        receiverId: req.user.id,
                    },
                ],
            },
        });

        if (existRelationship) {
            return next(createError("User already has relationship", 400));
        }

        await prisma.friend.create({
            data: {
                requesterId: req.user.id,
                receiverId: value.receiverId,
                status: STATUS_PENDING,
            },
        });

        res.status(201).json({ message: "Request has been sent" });
    } catch (error) {
        next(error);
    }
};

exports.acceptRequest = async (req, res, next) => {
    try {
        const { error, value } = checkRequesterIdSchema.validate(req.params);

        if (error) {
            return next(error);
        }
        const existRelationship = await prisma.friend.findFirst({
            where: {
                requesterId: value.requesterId,
                receiverId: req.user.id,
                status: STATUS_PENDING,
            },
        });
        if (!existRelationship) {
            return next(createError("Relation dose not exist", 400));
        }
        await prisma.friend.update({
            data: {
                status: STATUS_ACCEPTED,
            },
            where: {
                id: existRelationship.id,
            },
        });
        res.status(200).json({ message: "Accepted" });
    } catch (error) {
        next(error);
    }
};

exports.rejectRequest = async (req, res, next) => {
    try {
        const { value, error } = checkRequesterIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
        const existRelationship = await prisma.friend.findFirst({
            where: {
                receiverId: req.user.id,
                requesterId: value.requesterId,
                status: STATUS_PENDING,
            },
        });
        if (!existRelationship) {
            return next(createError("Relationship does not exist", 400));
        }
        await prisma.friend.delete({
            where: {
                id: existRelationship.id,
            },
        });
        res.status(200).json({ message: "Rejected" });
    } catch (error) {
        next(error);
    }
};

exports.cancelRequest = async (req, res, next) => {
    try {
        const { value, error } = checkReceiverIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
        const existRelationship = await prisma.friend.findFirst({
            where: {
                requesterId: req.user.id,
                receiverId: value.receiverId,
                status: STATUS_PENDING,
            },
        });
        if (!existRelationship) {
            return next(createError("Relationship does not exist", 400));
        }
        await prisma.friend.delete({
            where: {
                id: existRelationship.id,
            },
        });
        res.status(200).json({ message: "Cancel success" });
    } catch (error) {
        next(error);
    }
};

exports.unfriend = async (req, res, next) => {
    try {
        const { value, error } = checkFriendIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }

        const existRelationship = await prisma.friend.findFirst({
            where: {
                OR: [
                    { requesterId: req.user.id, receiverId: value.friendId },
                    { requesterId: value.friendId, receiverId: req.user.id },
                ],
                status: STATUS_ACCEPTED,
            },
        });
        if (!existRelationship) {
            return next(createError("Relationship does not exist", 400));
        }
        await prisma.friend.delete({
            where: {
                id: existRelationship.id,
            },
        });
        res.status(200).json({ message: "Unfriend Success" });
    } catch (error) {
        next(error);
    }
};
