const express = require('express');
const router = express.Router();

const User = require('../models').User;



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

router.post('/', (req, res, next) => {
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