const express = require("express");
const route = express.Router();
const auth = require("../config/auth");
const Dashboard = require("../models/Dashboard");

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


route.get("/dashboard", auth, async (req, res) => {
  if (!req.user) {
    return res.redirect('/login')
  }
  try {
    const myDashboardData = await Dashboard.findOne({ user: req.user._id }).select('-_id -user');
    if (myDashboardData) {
      return res.status(200).render("dashboard.ejs", {
        images: myDashboardData.image
      });
    }
    return res.status(200).render("dashboard.ejs", {
      images: null
    });
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ msg: 'Internal Server Error' });
  }

});

module.exports = route;
