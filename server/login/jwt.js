const jwt = require('jsonwebtoken');
const R = require('ramda');
const SEC = require('../secure/credentials')


function encodeToken(input) {
    return new Promise((resolve, reject) => {

        const now = Math.floor(Date.now() / 1000),
            iat = (now - 10),
            expiresIn = R.defaultTo(3600, input.expiresIn),
            expr = (now + expiresIn),
            notBefore = (now - 10),
            jwtId = Math.random().toString(36).substring(7);
        const payload = {
            iat: iat,
            jwtid: jwtId,
            audience: 'TEST',
            data: input.data
        };


        jwt.sign(payload, SEC.TOKEN_SECRET, { algorithm: 'HS256', expiresIn }, function(err, token) {
            if (err) {
                console.log('Error occurred while generating token');
                console.log(err);
                reject();
            }
            else {
                resolve(token);
            }
        });
    })
}

function decodeToken(token, callback) {
    jwt.verify(token, SEC.TOKEN_SECRET, callback);
}

function verifyToken(req, res, next) {
    console.debug('Verifying Token')
    const DEFAULT_ERROR_MSG = 'Failed to authenticate token.';
    var token = req.headers['x-access-token'];
    if (!token)
        return res.status(403).send({ auth: false, error_msg: 'No token provided.' });
    jwt.verify(token, SEC.TOKEN_SECRET, function(err, decoded) {
        if (err)
            return res.status(403).send({ auth: false, error_msg: R.defaultTo('Failed to authenticate token.')(err.message) });
        // if everything good, save to request for use in other routes
        req.userId = decoded.id;
        next();
    });
}
module.exports = verifyToken;

module.exports = { encodeToken, decodeToken, verifyToken };
