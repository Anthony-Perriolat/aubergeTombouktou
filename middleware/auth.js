const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
        const userId = decodedToken.userId;
        const permissions = decodedToken.permissions;
        req.auth = {
            userId: userId,
            permissions: permissions
        };
        next();
    }
    catch (error) {
        res.status(401).json({ error })
    }
}
