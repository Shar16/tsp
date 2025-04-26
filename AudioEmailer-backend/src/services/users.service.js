const {
    hashPassword,
    generateJwtToken,
    isValidPassword,
} = require("../utils/Auth");
const { CustomError } = require("../utils/CustomError");
const R = require("ramda");

const HIDDEN_FIELDS = [
    "accessToken",
    "accessTokenExpiresAt",
    "refreshToken",
    "refreshTokenExpiresAt",
    "expiresAt",
    "password",
];

const cleanUserObject = R.compose(
    R.over(R.lensPath(["linkedAccounts"]), R.map(R.omit(HIDDEN_FIELDS))),
    R.omit(["password"])
);

module.exports = ({ UsersModel }) => ({
    registerUser: async ({ name, email, password }) => {
        // Check if user already exists
        const user = await UsersModel.findOne({
            email,
        }).lean();
        if (user) throw new CustomError("User Already Exists");

        const hashedPassword = hashPassword(password);
        const newUser = new UsersModel({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();

        // Generate JWT token (similar to login)
        const { accessToken } = generateJwtToken({
            _id: newUser._id.toString(),
            email,
        });

        return { accessToken };
    },
    loginUser: async ({ email, password }) => {
        // Check if email and password is correct in database
        const user = await UsersModel.findOne({
            email,
        }).lean();
        if (!user) throw new CustomError("User Not Found");

        if (
            !isValidPassword({
                providedPassword: password,
                hashedPassword: user.password,
            })
        ) {
            throw new CustomError("Invalid Credentials");
        }

        // Generate JWT token for the authenticated user
        const { accessToken } = generateJwtToken({
            _id: user._id.toString(),
            email,
        });

        return { accessToken };
    },
    updateUserSettings: async ({ userId, ...payload }) => {
        const updatedUser = await UsersModel.findOneAndUpdate(
            { _id: userId },
            { $set: payload },
            { new: true }
        ).lean();
        return cleanUserObject(updatedUser);
    },
    getUserSettings: async ({ _id }) => {
        // This is similar to getUser but formatted for settings
        const user = await UsersModel.findOne({
            _id,
        }).lean();
        if (!user) throw new CustomError("User Not Found");
        return cleanUserObject(user);
    },
    getUser: async ({ _id }) => {
        const user = await UsersModel.findOne({
            _id,
        }).lean();
        if (!user) throw new CustomError("User Not Found");
        return R.omit(["password"], user);
    },
    addLinkedAccount: async ({ newAccount, userId, linkedAccount }) => {
        const user = await UsersModel.findOneAndUpdate(
            { _id: userId },
            newAccount
                ? { $push: { linkedAccounts: linkedAccount } }
                : { $set: { linkedAccounts: linkedAccount } },
            { new: newAccount }
        ).lean();
        if (!user) throw new CustomError("User Not Found");
        return R.omit(["password"], user);
    },
    updateEmailCredentials: async (userId, credentialId, updates) => {
        const user = await UsersModel.updateOne(
            {
                _id: userId,
                "linkedAccounts._id": credentialId,
            },
            {
                $set: {
                    "linkedAccounts.$.accessToken": updates.accessToken,
                    "linkedAccounts.$.refreshToken": updates.refreshToken,
                    "linkedAccounts.$.expiresAt": updates.expiresAt,
                },
            }
        );
        return R.omit(["password", "linkedAccounts"], user);
    },
});
