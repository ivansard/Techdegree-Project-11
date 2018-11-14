const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

//User schema and model

function validateEmail(email){
   const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
   return emailRegex.test(email);
}

const emailValidator = [validateEmail, 'Email must be in correct format!']

const UserSchema = new Schema({
    fullName: {type: String, required: true},
    emailAddress: {type: String, unique: true, validate: emailValidator},
    password: {type: String, required: true}
})

// Pre-save hook, which is used for hashing passwords
UserSchema.pre('save', function(next){
    //this will refer to the document which is about to be saved in the database
    const user = this;
    //Hashing the user's password
    bcrypt.hash(user.password, 10, function(error, hashedPassword){
        if(error){
            return next(error);
        }
        user.password = hashedPassword;
        next(); 
    })
})

//User authentication method
UserSchema.statics.authenticate = function(email, password, callback){
    //Find the document with the matching email
    User.findOne({emailAddress: email})
        .exec(function(error, user){
            if(error){
                let err = new Error('A user with the submitted email does not exist');
                err.status = 401;
                return callback(error);
            }
            //Check if the returned user's password matches the submitted one
            bcrypt.compare(password, user.password, function(error, result){
                //The compare function returns either an error or the result
                //Checking for the error
                if(error){
                    return callback(error);
                }
                //If everything is ok, we return the user in the callback
                if(result === true){
                    return callback(null, user); 
                } else {
                    return callback()
                }
            })
        })
}

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
    rating: {type: Number, required: true, validate: ratingValidator},
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

