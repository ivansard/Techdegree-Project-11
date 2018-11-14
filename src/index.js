'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

//Importing models

const Course = require('./models').Course
const User = require('./models').User
const Review = require('./models').Review


const app = express();

//Adding body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Adding session
app.use(session({
  secret: 'Ivan project',
  resave: true,
  saveUninitialized: false
}))

//Requiring paths
const userPaths = require('./routes/users');
const coursePaths = require('./routes/courses');

app.use('/api/users', userPaths);
app.use('/api/courses', coursePaths);

// Setting up mongoose
mongoose.connect('mongodb://localhost:27017/course-api');
const db = mongoose.connection;

db.on('error', error => {
  console.log('Connection error:', error);
})

db.once('open', () => {
  console.log('Db connection successful');
})

// Setting up port
app.set('port', process.env.PORT || 5000);

// Morgan supplying us with request logging
app.use(morgan('dev'));

// TODO add additional routes here




// send a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Course Review API'
  });
});

// uncomment this route in order to test the global error handler
// app.get('/error', function (req, res) {
//   throw new Error('Test error');
// });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
