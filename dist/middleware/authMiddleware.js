"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.replace('Bearer ', '');
            if (!token) {
                throw new Error('Missing token');
            }
            const decodedToken = jsonwebtoken_1.default.verify(token, `${process.env.TOKEN_SECRET}`);
            const userId = decodedToken.userId;
            // if (userId) {
            //   // On ajoute la propriété "auth" à l'objet "req"
            //   const auth = req.auth!;
            //   console.log(auth)
            //   auth.userId = userId ;
            // }
            const auth = req.auth || {};
            auth.userId = decodedToken.userId;
            req.auth = auth;
            next();
        }
        else {
            throw new Error('Missing authorization header');
        }
    }
    catch (error) {
        res.status(401).json({ error: error, message: "error auth" });
    }
};
exports.authMiddleware = authMiddleware;
