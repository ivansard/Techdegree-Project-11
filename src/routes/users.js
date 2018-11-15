const express = require('express');
const router = express.Router();

//Importing middleware 
const mid = require('../middleware/index')
//Importing user model
const User = require('../models').User;

// GET /api/users
// Retrieves the currently authenticated user
router.get('/', mid.headerAuthentication, (req, res, next) => {
        User.findById(req.session.userId)
            .exec( function(error, user){
                console.log(user);
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
})

// POST /api/users
// Creates a new user
router.post('/', (req, res, next) => {
    //Checking for the presence of email, password and full name
    if(req.body.emailAddress && req.body.password && req.body.fullName){
        //If all fields are there, create a user
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

// POST /api/users/login
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

// POST /api/users/logout
// Allows users to login
router.post('/logout', (req, res, next) => {
    //Checking for the presence of email and password
    if(req.session){
        req.session.destroy(function(error){
            if(error){
                return next(error);
            } else {
                return res.redirect('/')
            }
        })
    }
})

// PUT /api/users
// Hashes all of the passwords in the database
router.put('/',  (req, res, next) => {
    //Fetching all users from the database
    User.find({} ,function(error, users){
        if(error){
            return next(error);
        } else {
            console.log(users);
            users.forEach(function(user){
                user.set({
                    password: 'password'
                })
                user.save(function(error, updatedUser){
                    if(error){
                        return next(error);
                    }
                    console.log('Successfully updated user!');
                })
            })
            res.send('All passwords hashed in database!');
        }
    })
})

// router.put('/:courseId', mid.headerAuthentication, (req, res, next) => {
//     const courseId = req.params.courseId;
//     console.log(courseId);
//     //Based on the query parameters courseId, retrieve the specific course
//     Course.findById(courseId)
//         .exec(function(error, course){
//             console.log(course); 
//             if(error || !course){
//                 //If there was an error, send it back to the user
//                 error.status = 404;
//                 return next(error);
//             } else {
//                 //After retrieving the course, set its data to the request body
//                 course.set(req.body);
//                 console.log(course);
//                 //ERROR WITH UPDATING THE COURSE ID - ASKED ON SLACK
//                 course.save(function(error, updatedCourse){
//                     if(error){
//                             return next(error);
//                     }
//                 })
//             }
//         })
// })



module.exports = router;