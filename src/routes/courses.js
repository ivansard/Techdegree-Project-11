const express = require('express');
const router = express.Router();

const Course = require('../models').Course
const User = require('../models').User

// POST /api/courses
// Creates a new course

router.post('/', (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    //Checking if required fields title and description have been submitted
    if(title && description){
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
            title: title,
            description: description,
            estimatedTime: estimatedTime,
            materialsNeeded: materialsNeeded
        }, function(error, course){
            //If there is an error handle it
            if(error){
                return next(error);
            }
            //Redirect to the course details page for the newly created course
            res.redirect(`/api/courses/${course._id}`)
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
    Course.findById(courseId)
          .exec(function(error, course){
              if(error){
                   //If there was an error, send it back to the user
                   let err = new Error('Unfortunately, the course could not be found');
                   //Should it be 404?
                   err.status = 404;
                   return next(err);
              }
              return res.json(course);
          })
})

// GET /api/courses
// Returns the course id and title for all courses
router.get('/', (req, res, next) => {

})



module.exports = router;