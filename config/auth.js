const jwt = require('jsonwebtoken');

// module.exports = {
//     verify: function (req, res, next) {
//         let accessToken = req.cookies.token;

//         //if there is no token stored in cookies, the request is unauthorized
//         if (!accessToken || accessToken.toString() === 'loggedout') {
//             return next();
//         } else {
//             const decoded = jwt.verify(accessToken, 'jwtsecret');
//             req.user = decoded.user;
//             return next();
//         }
// },
// isAuthenticated: function (req, res, next) {
//     if (req.user === null || req.user === undefined) {
//         return res.status(403).redirect('/');
//     }
//     else {
//         return next();
//     }
// },
// };


// const jwt = require("jsonwebtoken");
// const config = require("config");
// const jwtsecret = config.get("jwtsecret");

const auth = (req, res, next) => {
    // const token = req.headers['token'];
    const token = req.cookies.token;

    //Check if token is not avaliable
    if (!token) {
        res.locals = { status: 401, msg: 'Authorization Denied' }
        return next()
    }

    //Verify token
    try {
        const decoded = jwt.verify(token, 'jwtsecret');
        req.user = decoded.user;
        return next();
    } catch (error) {
        res.locals = { status: 403, msg: "Token is not valid" };
        return next()
    }
}

module.exports = auth;