  const express = require('express');
const validator = require('validator');
const router = new express.Router();
const passport = require('passport');
const localLogin = require('../passport/local-login');
const db = require('../queries');
const iv = require('../utils/validation');
function checkUserEmail(payload){
    const errors = {};
    let success = true;
    const promises = [
      db.getUser(payload.username)
      .then(data => {
        if(data.length !== 0){
          errors.username = 'Username already taken.';
          success = false;
        }
      }),
      db.checkEmail(payload.email)
      .then(data =>{
        if(data.length !== 0){
          errors.email = 'Email already in use.';
          success = false;
        }
      })
    ];
    return Promise.all(promises).then(res=>{
      return {success,errors};
    });
}
function checkLogin(payload){
  let message = '';
  let success = true;
  return db.checkPassEmail(payload.email,payload.password).then(username=>{
      if(!username){
        message = "Email and password do not match";
        success = false;
      }
      return {message,success,username};
  });
}

function auth(req,res){
    return passport.authenticate('local-login', (err, token, userData) => {
      req.login(req.body.username,err=>{
        return res.json({
          success: true,
          message: 'You have successfully logged in!',
          token: req.body.username
        });
      });

  })(req,res);
}

function validateSignupForm(payload) {
  const errors = {};
  let isFormValid = true;

  if (!iv.isEmail(payload.email)) {
    isFormValid = false;
    errors.email = 'Please provide a correct email address.';
  }

  if (!iv.isPassword(payload.password)) {
    isFormValid = false;
    errors.password = 'Password must have at least 8 characters.';
  }

  if (!iv.isPassword(payload.password2) || payload.password2.trim() !== payload.password.trim()) {
    isFormValid = false;
    errors.password2 = 'Passwords must match.';
  }
  if(!iv.isUsername(payload.username)){
    isFormValid = false;
    errors.username = 'Username must be between 8 and 16 characters';
  }

  if (!isFormValid) {
    errors.message = 'Check the form for errors.';
  }
  return {
    success: isFormValid,
    errors
  };
}
function validateLoginForm(payload){
  const errors = {};
  let success = true;
  if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email)) {
    success = false;
    errors.email = 'Please provide a correct email address.';
  }
  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
    success = false;
    errors.password = 'Password must have at least 8 characters.';
  }
  if(!success)
    errors.message = "Please check the form for errors";
  return{
    success,
    errors
  }
}

router.post('/signup',(req, res) => {
  let validationResult = validateSignupForm(req.body);
  if (!validationResult.success) {
    return res.status(400).json(validationResult);
  }
  checkUserEmail(req.body)
  .then(dbRes => {
    if (!dbRes.success) {
      return res.status(400).json(dbRes);
    }})
  .then(db.addUser(req.body))
  .then(username => {
    console.log("User added to database");
    return res.status(200).json({success: true, message:'You have successfully signed up! Now you should be able to log in.'});
  });
});

router.post('/login',(req,res)=>{
  let validationResult = validateLoginForm(req.body);
  if(!validationResult.success){
    return res.status(400).json(validationResult);
  }
  checkLogin(req.body).then(dbRes =>{
    if(!dbRes.success){
      return res.status(400).json(dbRes);
    }
    req.body.username = dbRes.username;
    return auth(req,res);
  });
});

router.post('/logout',(req,res)=>{
  req.logout();
  req.session.destroy();
  res.status(200);
});

router.post('/isAuthenticated',(req,res)=>{
    res.json({connected:req.isAuthenticated(),user:req.user});
});
passport.use('local-login',localLogin);

passport.serializeUser(function(username, done) {
  done(null, username);
});
passport.deserializeUser(function(username, done) {
    done(null, username);
});

module.exports = router;
