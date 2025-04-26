const {
    saveSettingsReqSchema,
} = require("../request-schemas/settings.request-schema");
const {
    registerReqSchema,
    loginReqSchema,
} = require("../request-schemas/user.request-schema");

module.exports = ({ UsersService }) => ({
    registerUser: async (req, res, next) => {
        const { error, value } = registerReqSchema.validate(req.body);
        if (error) return next(error);

        try {
            const { accessToken } = await UsersService.registerUser(value);
            return res.status(200).send({ accessToken });
        } catch (error) {
            return next(error);
        }
    },
    loginUser: async (req, res, next) => {
        const { error, value } = loginReqSchema.validate(req.body);
        if (error) return next(error);

        try {
            const { accessToken } = await UsersService.loginUser(value);
            return res.status(200).send({ accessToken });
        } catch (error) {
            return next(error);
        }
    },
    updateUserSettings: async (req, res, next) => {
        const { error, value } = saveSettingsReqSchema.validate(req.query);
        if (error) return next(error);
        try {
            const updatedUser = await UsersService.updateUserSettings({
                userId: req.user._id,
                ...value,
            });
            return res.status(200).send(updatedUser);
        } catch (error) {
            return next(error);
        }
    },
    getUserSettings: async (req, res, next) => {
        try {
            const user = await UsersService.getUserSettings({
                _id: req.user._id,
            });
            return res.status(200).send(user);
        } catch (error) {
            return next(error);
        }
    },
});
