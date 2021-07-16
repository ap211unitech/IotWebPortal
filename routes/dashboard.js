const express = require("express");
const route = express.Router();
const request = require("request");
const API_DATA = require("../models/API_DATA");
const auth = require("../config/auth");

//@Route    GET /dashboard
//@desc     Get Data of sensors and saving to Database
//@access   Public
route.get("/", auth, async (req, res) => {
  try {
    const optionss = {
      uri: `http://my-json-server.typicode.com/ap211unitech/JSON-Fake-API/data`,
      method: "GET",
      headers: {
        "user-agent": "node.js"
      }
    };
    request(optionss, async (err, response, body) => {
      if (err) console.error(err);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Such API exists" });
      }
      body = JSON.parse(body);

      // Including Data in Database
      for (let data of body) {
        const { id, location, time_of_reading, weight } = data;

        // Finding if this query (exactly) is already present or not
        const findData = await API_DATA.findOne({
          $and: [{ id }, { time_of_reading }, { weight }, { location }]
        });

        // If not present , then Save it to Database
        if (!findData) {
          const newData = new API_DATA({
            id,
            location,
            time_of_reading,
            weight
          });
          await newData.save();
        }
      }

      // Returning all data
      const allData = await API_DATA.find();
      return res.status(200).json(allData);
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = route;
