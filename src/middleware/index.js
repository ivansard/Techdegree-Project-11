const auth = require('basic-auth');
const User = require('../models').User;

function headerAuthentication(req, res, next){
    const user = auth(req);
    //Checking to see if the authorization header data is there
    if(user){
        const emailAddress = user.name;
        const password = user.pass;
        if(emailAddress && password){
            User.authenticate(emailAddress, password, function(error, user){
              //If an error was returned, or if there is no returned user, return an error
              if(error || !user){
                  let err = new Error('Invalid credentials')
                  err.status = 401;
                  return next(err);
              }
              //If a user was returned, set his id in the session, and pass on to the next piece of middleware
              req.session.userId = user._id;
              return next();
            })
        } else {
            const error = new Error('Both email and password are required');
            error.status = 403;
            return next(error);
        }
    }
}

module.exports.headerAuthentication = headerAuthentication
