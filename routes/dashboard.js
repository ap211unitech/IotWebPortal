const express = require("express");
const route = express.Router();
const request = require("request");
const API_DATA = require("../models/API_DATA");
const auth = require("../config/auth");
const LiveData = require("../models/LiveData");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

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
      if (findSensor.data.length >= 5000) {
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

});

route.get("/getLiveSensorData", async (req, res) => {
  const data = await LiveData.find();
  return res.status(200).json(data);
});

// Export File for a Sensor ID
route.post("/exportdata", async (req, res) => {
  const body = req.body;
  if (body.type == "all") {
    const csvWriter = createCsvWriter({
      path: "public/temp.csv",
      header: [{ id: "timestamp", title: "timestamp" }],
    });

    body.sensorId.forEach((elm) => {
      csvWriter.csvStringifier.header.push({ id: elm, title: elm });
    });

    let records = [];

    body.sensorId.forEach((id) => {
      LiveData.findOne({ sensorId: id }).then((a) => {
        if (a) {
          a.data.forEach((elm) => {
            let obj = {
              timestamp: new Date(elm.time).toLocaleString(),
              [id]: elm.data,
            };
            records.push(obj);
          });
        }
      });
    });

    setTimeout(() => {
      console.log(records, "HERERRER");
      csvWriter
        .writeRecords(records) // returns a promise
        .then(() => {
          console.log("...Done");
        });
      res.download("public/temp.csv");
      return;
    }, 1000);
  } else if (body.type == "single") {
    const { data } = await LiveData.findOne({ sensorId: body.sensorId });
    const csvWriter = createCsvWriter({
      path: "public/temp.csv",
      header: [
        { id: "timestamp", title: "timestamp" },
        { id: [body.sensorId], title: [body.sensorId] },
      ],
    });

    const records = [];

    data.forEach((elm) => {
      let obj = {
        timestamp: new Date(elm.time).toLocaleString(),
        [body.sensorId]: elm.data,
      };
      records.push(obj);
    });

    csvWriter
      .writeRecords(records) // returns a promise
      .then(() => {
        console.log("...Done");
      });
    res.download("public/temp.csv");
    return;
  }
});

module.exports = route;
