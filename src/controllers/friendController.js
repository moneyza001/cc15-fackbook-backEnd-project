const { checkReceiverIdSchema } = require("../validators/userValidater");

exports.requestFriend = async (req, res, next) => {
    try {
        const { error } = checkReceiverIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
        res.status(201).json({ message: "Request has been sent" });
    } catch (error) {
        next(error);
    }
};
