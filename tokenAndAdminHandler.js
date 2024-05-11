const jwt = require('jsonwebtoken');
//json webtoken should be stored with bearer in auth
//login verify kore.
const verifyToken = (req, res, next) => {
    const { authorization } = req.headers;
    try {
        //access_token_amr nijer icche moto kisu dite parbo
        
        const token = authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const { email, username, role } = decode; req.email = email;
        req.name = username;
        req.role = role;
        //forward next url
        next();
    } catch {
        next('Authentication Failure');
    }
}

//if amin or not for deleting task
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'authorization failed !' });
    }
    next();
};


module.exports = { verifyToken, isAdmin };
