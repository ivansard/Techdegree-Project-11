const express = require('express');
const router = express.Router();

//Importing models
const Course = require('../models').Course
const Review = require('../models').Review

//Importing middleware

const mid = require('../middleware/index')

// POST /api/courses
// Creates a new course
router.post('/', mid.headerAuthentication, (req, res, next) => {
    //Checking if required fields title and description have been submitted
    if(req.body.title && req.body.description){
        //Checking for estimatedTime and materialsNeeded
        let estimatedTime = req.body.estimatedTime;
        if(estimatedTime === undefined){
            estimatedTime = '';
        }
        let materialsNeeded = req.body.materialsNeeded;
        if(materialsNeeded === undefined){
            materialsNeeded = '';
        }
        //Creating the course based on submitted data
        Course.create({
            user: req.session.userId,
            title: req.body.title,
            description: req.body.description,
            estimatedTime: estimatedTime,
            materialsNeeded: materialsNeeded
        }, function(error, course){
            //If there is an error handle it
            if(error){
                error.status = 400
                return next(error);
            }
            //Reset the location header, and return no content
            res.redirect(`/`, 201);
        })
    } else {
        const error = new Error('Title and description are required');
        error.status = 401;
        return next(error);
    }
})

// GET /api/courses/:courseId
// Returns the course id and title for the given course
router.get('/:courseId', (req, res, next) => {
    const courseId = req.params.courseId;
    //Using deep population to fetch only the full names of the users
    Course.findById(courseId)
          .populate('user', 'fullName')
          .populate({
              path: 'reviews',
              model: 'Review',
              populate: {
                  path: 'user',
                  model: 'User',
                  select: 'fullName'
              }
          })
          .exec(function(error, course){
              if(error){
                   //If there was an error, send it back to the user
                   let err = new Error('Unfortunately, the course could not be found');
                   //Should it be 404?
                   err.status = 404;
                   return next(err);
              }
              return res.status(200).json(course);
          })
})

// GET /api/courses
// Returns the course id and title for all courses
router.get('/', (req, res, next) => {
    //Selecting only the id and title fields of all courses
    Course.find({}, '_id title', function(error, courses){
        if(error){
            //If there was an error, send it back to the user
            error.status = 404;
            return next(error);
        } else {
            //If not return the course results as json
            return res.status(200).json(courses);
        }
    })
})

// PUT api/courses/:courseId
// Updates the given course
router.put('/:courseId', mid.headerAuthentication, (req, res, next) => {
    const courseId = req.params.courseId;
    console.log(courseId);
    //Based on the query parameters courseId, retrieve the specific course
    Course.findById(courseId)
        .exec(function(error, course){
            //If the course is null/undefined, the submitted id is wrong
            if(!course){
                let err = new Error('Course with submitted id does not exist in db')
                err.status = 400;
                return next(err);
            }
            //If there was an error, send it back to the user
            if(error){
                error.status = 404;
                return next(error);
            } else {
                //After retrieving the course, set its data to the request body
                course.set(req.body);
                course.save(function(error, updatedCourse){
                    if(error){
                            error.status = 400;
                            return next(error);
                    }
                    //204 indicates that the request has succeeded, but that the client doesn't need to go away from its current page
                    return res.status(204).send()
                })
            }
        })
})
// POST /api/courses/:courseId/reviews
// Creates a review for the specified course
router.post('/:courseId/reviews', mid.headerAuthentication, (req, res, next) => {
    const courseId = req.params.courseId;
    //Based on the query parameters courseId, retrieve the specific course
    Course.findById(courseId)
        .exec(function(error, course){
            //If the course is null/undefined, the submitted id is wrong
            if(!course){
                let err = new Error('Course with submitted id does not exist in db')
                err.status = 400;
                return next(err);
            }
            //If there was an error, send it back to the user
            if(error){
                error.status = 404;
                return next(error);
            } else {
                //Validation that user cannot review his own course
                console.log(course.user._id);
                console.log(req.session.userId);
                if(course.user._id.equals(req.session.userId)){
                    let err = new Error('User who created this course cannot review it');
                    err.status = 400;
                    return next(err);
                }
                //The review must firstly be saved to the db
                Review.create({
                    user: req.session.userId,
                    rating: req.body.rating
                }, function(error, review){
                    if(error){
                        return next(error);
                    }
                    //After the review has been created
                    //We will add its id to the courses reviews array
                    let courseReviews = course.reviews;
                    courseReviews.push(review._id);
                    //Set the new updated array to the course and save it to the db
                    course.set({reviews: courseReviews})
                    course.save(function(error, updatedCourse){
                        //Error handling
                        if(error){
                            return next(error);
                        }
                        //Redirecting to the course detail page
                        res.redirect(`/api/courses/${updatedCourse._id}`, 201);
                    })
                })
            }
        })
})



module.exports = router;