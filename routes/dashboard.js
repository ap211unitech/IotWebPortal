const express = require("express");
const route = express.Router();
const request = require("request");
const API_DATA = require("../models/API_DATA");
const auth = require("../config/auth");
const LiveData = require("../models/LiveData");
const fs = require("fs");

//@Route    GET /dashboard
//@desc     Get Data of sensors and saving to Database
//@access   Public
route.get("/liveSensorDataUsingAPI", auth, async (req, res) => {
  try {
    const optionss = {
      uri: `http://my-json-server.typicode.com/ap211unitech/JSON-Fake-API/data`,
      method: "GET",
      headers: {
        "user-agent": "node.js",
      },
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
          $and: [{ id }, { time_of_reading }, { weight }, { location }],
        });

        // If not present , then Save it to Database
        if (!findData) {
          const newData = new API_DATA({
            id,
            location,
            time_of_reading,
            weight,
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

route.post("/liveSensorData", async (req, res) => {
  res.json({ msg: "Got the temp data, thanks..!!" });

  const main = [];
  let content = JSON.parse(`${JSON.stringify(req.body)}`.slice(1, -4));
  const arr = content.split("|");
  arr.forEach((elm) => {
    let obj = JSON.parse(elm.replace(/'/gi, `"`));
    obj["time"] = new Date().toISOString();
    main.push(obj);
  });

  main.forEach(async (elm) => {
    let findSensor = await LiveData.findOne({ sensorId: elm.id });
    if (findSensor) {
      if (findSensor.data.length >= 50) {
        findSensor.data.pop();
      }
      findSensor.data.unshift({
        time: elm.time,
        data: elm.data,
      });
      await findSensor.save();
    } else {
      const newSensor = new LiveData({
        sensorId: elm.id,
        data: [
          {
            time: elm.time,
            data: elm.data,
          },
        ],
      });
      await newSensor.save();
    }
  });

  fs.writeFile("public/temp.json", JSON.stringify(main), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
});

route.get("/getLiveSensorData", async (req, res) => {
  const data = await LiveData.find();
  return res.status(200).json(data);
  // const data = fs.readFileSync("public/temp.json", "utf8");
  // if (data) return res.json(JSON.parse(data));
  // return res.json(null);
});

// Export File for a Sensor ID
route.post("/exportdata", async (req, res) => {
  const body = req.body;
  if (body.type == "all") {
    let data = [];
    body.sensorId.forEach(async (elm) => {
      const a = await LiveData.findOne({ sensorId: elm });
      if (a != null) {
        data.push(a);
        fs.writeFileSync("public/temp.json", JSON.stringify(data));
      }
    });

    fs.writeFileSync("public/temp.json", JSON.stringify(data));
    res.download("public/temp.json");
    return;
  } else if (body.type == "single") {
    const data = await LiveData.findOne({ sensorId: body.sensorId });
    console.log(data);
    fs.writeFile("public/temp.json", JSON.stringify(data), (err) => {
      if (err) throw err;
      console.log("Data written to file and downloaded...");
    });
    // const newData = fs.readFileSync("public/temp.json", "utf8");
    // return res.json(JSON.parse(newData));
    res.download("public/temp.json");
    return;
    // return {msg: "Data Received!"};
  }
});

module.exports = route;
