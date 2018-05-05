const express = require('express');
const bodyParser = require('body-parser')
const {mongoose} = require('./database/mongoose');
global.__root   = __dirname + '/'; 

const app = express();

// Check if api works
app.get('/api', function (req, res) {
    res.status(200).send('API works.');
});

// Basic Routes
var UserController = require(__root + 'controllers/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'controllers/AuthController');
app.use('/api/auth', AuthController);


// Basic api port
app.listen(process.env.PORT || 3000, () => {
    console.log('App started on port 3000!')
});