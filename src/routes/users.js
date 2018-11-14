const express = require('express');
const router = express.Router();

const User = require('../models').User;

// GET /api/users
// Retrieves the currently authenticated user

router.get('/', (req, res, next) => {
    //Check if there is a user in the current session
    if(req.session.userId){
        //If there is, query the database with his id to get the whole user document
        User.findById(req.session.userId)
            .exec( function(error, user){
                if(error){
                    //If there was an error, send it back to the user
                    let err = new Error('Unfortunately, the user could not be found');
                    //Should it be 404?
                    err.status = 404;
                    return next(err);
                } else {
                    //If not, then send back the currently authenticated user
                    return res.json(user);
                }
            })
    } else {
        return res.json({
            "message": "There is no user currently logged in"
        })
    }
})

// POST /api/users
// Creates a new user
router.post('/', (req, res, next) => {
    //Checking for the presence of email, password and full name
    if(req.body.emailAddress && req.body.password && req.body.fullName){
        //If all fields are there, create a user
        console.log('Here');
        User.create({
            fullName: req.body.fullName,
            emailAddress: req.body.emailAddress,
            password: req.body.password
        }, function(error, user){
            //If there was an error, handle it
            if(error){
                return next(error);
            }
            //If a user was returned, set his id in the session, and redirect to the get route
            req.session.userId = user._id;
            res.redirect('/');

        })
    } else {
      //If either email or password is missing we create a 401 error
      //which represents 'Unauthorized' - missing or bad authentication
      let error = new Error('Email, password, and full name are all mandatory')
      error.status = 401 
      return next(error); 
    }
})

// POST /api/users/long
// Allows users to login
router.post('/login', (req, res, next) => {
    //Checking for the presence of email and password
    if(req.body.emailAddress && req.body.password){
        User.authenticate(req.body.emailAddress, req.body.password, function(error, user){
          //If an error was returned, or if there is no returned user, return an error
          if(error || !user){
              let err = new Error('Invalid username and/or password');
              err.status = 401;
              return next(err);
          }
          //If a user was returned, set his id in the session, and redirect to the get route
          req.session.userId = user._id;
          res.redirect('/');
        })
      } else {
        //If either email or password is missing we create a 401 error
        //which represents 'Unauthorized' - missing or bad authentication
        let error = new Error('Both email and password must be submitted')
        error.status = 401 
        return next(error); 
      }
})



module.exports = router;