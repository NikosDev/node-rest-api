var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var User = require('../models/User');


function validateRefreshToken(req, res, next) {  
    User.findOne({refreshToken: req.body.token}, { password: 0 }, function(err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        console.log(user)

        var newtoken = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 600
        });
        console.log(newtoken)
        req.token = newtoken;
        next();
    });
}

module.exports = validateRefreshToken;