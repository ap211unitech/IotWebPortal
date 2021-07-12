const express = require("express");
const route = express.Router();
const auth = require("../config/auth");

// Login Page 
route.get('/login', auth, (req, res) => {
  console
  if (!req.user) {
    return res.render('User/login.ejs')
  }
  return res.redirect('/dashboard');
})

// Register Page 
route.get('/register', auth, (req, res) => {
  if (!req.user) {
    return res.render('User/signup.ejs')
  }
  return res.redirect('/dashboard');
})


route.get("/dashboard", auth, (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }
  return res.status(200).render("dashboard.ejs");

});

module.exports = route;
