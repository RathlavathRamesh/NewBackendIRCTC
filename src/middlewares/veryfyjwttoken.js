// middleware/verifyToken.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyUserToken = (req, res, next) => {
    const token = req.headers['authorization'].split(' ')[1];
    console.log("Token got from front end",token);
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, process.env.USER_SECRET_TOKEN);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send("You are not authorized to perform this action");
    }
    return next();
};

export {verifyUserToken, isAdmin };
