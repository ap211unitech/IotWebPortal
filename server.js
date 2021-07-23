const express = require("express");
const app = express();
const ConnectDB = require("./config/connect");
const expressEjslayouts = require("express-ejs-layouts");
const path = require("path");

// Cookies
const cookieparser = require('cookie-parser');
app.use(cookieparser());

//Connect Database
ConnectDB();

//Servig static files
app.use(express.static(`${__dirname}/public`));

app.use(expressEjslayouts);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Routes
app.use("/", require("./routes/viewRoutes")); // Dashbord

// Server Routes
app.use('/', require("./routes/users")); // Login / Signup / Logout Routes
app.use("/call_data", require("./routes/dashboard"));
app.use('/uploadSensorImage', require("./routes/upload"));
app.use('/', require("./routes/addGeolocation"));
app.use('/', require("./routes/sensor"));


app.get("*", (req, res) => {
  return res.redirect("/dashboard");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
