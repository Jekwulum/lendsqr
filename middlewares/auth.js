require("dotenv").config();
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers['authorization'];

    if (!token) {
        return res.status(403).json("Token required")
    };

    try {
        const decodedToken = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decodedToken;
    } catch (error) {
        return res.status(401).json("Token is Invalid");
    };
    return next();
};
module.exports = validateToken;