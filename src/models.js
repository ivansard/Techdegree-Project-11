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

UserSchema.statics.authenticate = function(email, password, callback){
    //Find the document with the matching email
    User.findOne({email: email})
        .exec(function(error, user){
            if(error){
                let err = new Error('A user with the submitted email does not exist');
                err.status = 401;
                return callback(error);
            }
            //Check if the returned user's email matches the submitted one
            //ENCRYPTION CHECK-UP NEEDED HERE
            if(user.password !== password){
                let err = new Error('Incorrect password');
                err.status = 401;
                return callback(error);
            }
            //If everything is ok, we return the user in the callback
            return callback(null, user);
        })
}


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

