var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var randtoken = require('rand-token');

var VerifyToken = require('./VerifyToken'); 
var validateRefreshToken = require('./RefreshToken'); 

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../models/User');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

router.post('/login', function(req, res) {

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    
    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 900 // expires in 24 hours
    });    

    res.status(200).send({ auth: true, token: token, refreshToken: user.refreshToken});
  });

});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function(req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var refreshToken = randtoken.uid(256); 

  User.create({
    name : req.body.name,
    email : req.body.email,
    password : hashedPassword,
    refreshToken: refreshToken
  }, 
  function (err, user) {
    if (err) return res.status(500).send("There was a problem registering the user`.");

    // if user is registered without errors
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 900 // expires in 24 hours
    });

    
    res.status(200).send({ auth: true, token: token });
  });

});

router.get('/me', VerifyToken, function(req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

// req.body.token = "refreshToken"
router.post('/refresh', function(req, res, next) {
  if (req.body.token== null){
    return res.status(404).send("Provide a token!");
  }
  
  User.findOne({refreshToken: req.body.token}, { password: 0 }, function(err, user) {
    if (err) return next(err);
    
    if (user){
      var newtoken = jwt.sign({ id: user._id }, config.secret, {
          expiresIn: 600
      });
      res.status(200).send({token: newtoken});
    }else{
      return res.status(404).send("Token not found!");
    }
  });
});


module.exports = router;