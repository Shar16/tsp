const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Add and remove delimiter :
const formatPassword = ({ salt, hash }) => `${hash}:${salt}`;
const extractHashedPassword = (password) => {
    const [hash, salt] = password.split(":");
    return { hash, salt };
};

// Password helpers
const hashPassword = (password) => {
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");
    return formatPassword({ salt, hash });
};

const isValidPassword = ({ providedPassword, hashedPassword }) => {
    const { hash, salt } = extractHashedPassword(hashedPassword);
    const providedHash = crypto
        .pbkdf2Sync(providedPassword, salt, 1000, 64, "sha512")
        .toString("hex");
    return hash === providedHash;
};

const generateJwtToken = ({ _id, email }) => {
    const secretKey = process.env.JWT_SECRET;
    const payload = { _id, email };
    const accessToken = jwt.sign(payload, secretKey, {
        expiresIn: "90d",
    });
    return { accessToken };
};

module.exports = { hashPassword, isValidPassword, generateJwtToken };
