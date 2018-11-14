const auth = require('basic-auth');
const User = require('../models').User;

function headerAuthentication(req, res, next){
    const user = auth(req);
    console.log(user.name);
    console.log(user.pass);
    //Checking to see if the authorization header data is there
    if(user){
        const emailAddress = user.name;
        const password = user.pass;
        if(emailAddress && password){
            User.authenticate(emailAddress, password, function(error, user){
              //If an error was returned, or if there is no returned user, return an error
              console.log('User is', user);
              if(error || !user){
                  console.log('Erroring here');
                  return next(error);
              }
              //If a user was returned, set his id in the session, and pass on to the next piece of middleware
              req.session.userId = user._id;
              return next();
            })
        } else {
            const error = new Error('You are not logged in to access this');
            error.status = 403;
            return next(error);
        }
    }
}

module.exports.headerAuthentication = headerAuthentication
