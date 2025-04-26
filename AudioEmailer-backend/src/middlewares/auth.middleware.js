const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send({ message: "Unauthorized" });

    const [prefix, token] = authHeader.split(" ");
    if (!prefix || !token || prefix !== "Bearer")
        return res.status(401).send({ message: "Invalid token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // subset of user object
        return next();
    } catch (error) {
        return res.status(401).send({ message: "Invalid token" });
    }
};

module.exports = { checkAuth };
