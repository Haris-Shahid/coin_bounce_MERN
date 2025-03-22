const User = require("../models/user");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");

const auth = async (req, res, next) => {
    try {
        const { refreshToken, accessToken } = req.cookies;

        if (!refreshToken || !accessToken) {
            return res.status(401).json({ message: "Unauthorized: No tokens provided" });
        }

        let _id;
        try {
            const decoded = JWTService.verifyAccessToken(accessToken);
            _id = decoded._id; // Ensure we're only getting the _id
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "jwt expired" }); // Return 401 instead of next(error)
            }
            return res.status(401).json({ message: "Invalid token" });
        }

        let user;
        try {
            user = await User.findOne({ _id });
            if (!user) {
                return res.status(401).json({ message: "Unauthorized: User not found" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Internal server error" });
        }

        req.user = new UserDTO(user);
        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = auth;