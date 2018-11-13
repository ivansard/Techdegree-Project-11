const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//User schema and model

function validateEmail(email){
   const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email.text);
}

const emailValidator = [validateEmail, 'Email must be in correct format!']

const UserSchema = new Schema({
    fullName: String,
    email: {type: String, unique: true, validate: emailValidator},
    password: String
})

const User = mongoose.model('User', UserSchema);

//Review schema and model

function validateRating(rating){
    if(rating >= 1 && rating <=5){
        return true;
    }
    return false;
}

const ratingValidator = [validateRating, 'Rating must be between 1 and 5'];

const ReviewSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    postedOn: {type: Date, default: Date.now},
    rating: {type: Number, validate: ratingValidator},
    review: String
})

const Review = mongoose.model('Review', ReviewSchema);

//Course schema and model

const CourseSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    title: {type: String, required: true},
    description: {type: String, required: true},
    estimatedTime: String,
    materialsNeeded: String,
    steps: [{
        stepNumber: Number,
        title: {type: String, required: true},
        description: {type: String, required: true}
    }],
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
})

const Course = mongoose.model('Course', CourseSchema);

// module.exports.Course = Course;
// module.exports.Review = Review;
// module.exports.User = User;

module.exports = {
    User: User,
    Review: Review,
    Course: Course
}

