const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    //Checking for the presence of email and password
    if(req.email && req.password){
      User.authenticate(req.email, req.password, function(error, user){
        //If an error was returned, or if there is no returned user, return an error
        res.send('Validated user')
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