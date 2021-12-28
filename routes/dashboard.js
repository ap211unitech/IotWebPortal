const express = require("express");
const route = express.Router();
const request = require("request");
const API_DATA = require("../models/API_DATA");
const auth = require("../config/auth");
const LiveData = require("../models/LiveData");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const Sensor = require("../models/Sensor");
const Geolocations = require("../models/GeoLocations");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const SelectUser = require("../models/SelectUser");

// Fake API for testing.
// route.get("/liveSensorDataUsingAPI", auth, async (req, res) => {
//   try {
//     const optionss = {
//       uri: `http://my-json-server.typicode.com/ap211unitech/JSON-Fake-API/data`,
//       method: "GET",
//       headers: {
//         "user-agent": "node.js",
//       },
//     };
//     request(optionss, async (err, response, body) => {
//       if (err) console.error(err);
//       if (response.statusCode !== 200) {
//         return res.status(404).json({ msg: "No Such API exists" });
//       }
//       body = JSON.parse(body);

//       // Including Data in Database
//       for (let data of body) {
//         const { id, location, time_of_reading, weight } = data;

//         // Finding if this query (exactly) is already present or not
//         const findData = await API_DATA.findOne({
//           $and: [{ id }, { time_of_reading }, { weight }, { location }],
//         });

//         // If not present , then Save it to Database
//         if (!findData) {
//           const newData = new API_DATA({
//             id,
//             location,
//             time_of_reading,
//             weight,
//           });
//           await newData.save();
//         }
//       }

//       // Returning all data
//       const allData = await API_DATA.find();
//       return res.status(200).json(allData);
//     });
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).send("Internal Server Error");
//   }
// });

// Getting Live Data From NodeMCU.
route.post("/liveSensorData", async (req, res) => {
  res.json({ msg: "Got the data, thanks..!!" });
  const main = [];
  let content = JSON.parse(`${JSON.stringify(req.body)}`.slice(1, -4));
  const arr = content.split("|");


  arr.forEach((elm) => {
    let obj = JSON.parse(elm.replace(/'/gi, `"`));
    obj["time"] = new Date().toISOString();
    main.push(obj);
  });


  // This part is for sending alert mails.
  main.forEach(async (elm) => {
    // Searching for threshold values in Sensor Model
    const allData = await Sensor.find();
    allData.forEach(a => {
      const sensorArray = a.sensor;
      sensorArray.forEach(b => {
        const dataArray = b.data;
        dataArray.forEach(c => {
          const sensorDetailArray = c.sensorDetail;
          sensorDetailArray.forEach(async d => {
            if (d.sensorId == elm.id && d.isVerified == true) {
              let obj = {};

              obj["minThreshold"] = d.minThreshold;
              obj["maxThreshold"] = d.maxThreshold;
              obj["sensorName"] = d.sensorName;
              obj["parentID"] = a.user;
              obj["geolocationID"] = b.geolocation;
              obj["sensorUUID"] = d.sensorId;

              const minThreshold = obj["minThreshold"];
              const maxThreshold = obj["maxThreshold"];
              const sensorName = obj["sensorName"];

              const userDetails = await User.findById(obj["parentID"]);

              const geolocationDetails = await Geolocations.findById(obj["geolocationID"]);

              // Search For Sensor In liveData 
              const sensorInLiveData = await LiveData.findOne({ sensorId: obj["sensorUUID"] });
              var lastsent = new Date(sensorInLiveData.lastEmailSent);
              var today = new Date();
              var diffMs = (today - lastsent);
              var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

              // console.log("Here");
              if (diffMins >= 0.5) {
                let subUsers = [];
                if(userDetails.type != "admin") {
                  subUsers = await SelectUser.find({user: obj["parentID"]});

                }
                if (elm.data < minThreshold) {
                  // Send Email
                  let store = {
                    to: userDetails.email,
                    userName: userDetails.name,
                    sensorName: sensorName,
                    geolocation: geolocationDetails.name,
                    minThreshold: minThreshold,
                    currentData: elm.data,
                    flag: false,
                  }
                  sendEmail(store)
                  subUsers.forEach((user) => {
                    console.log(user);
                    store["to"] = user.email;
                    store["userName"] = "user";
                    sendEmail(store);
                  })
                  sensorInLiveData.lastEmailSent = new Date();
                  await sensorInLiveData.save();
                  console.log("Email Sent For Min Threshold");
                }
                else if (elm.data > maxThreshold) {
                  let store = {
                    to: userDetails.email,
                    userName: userDetails.name,
                    sensorName: sensorName,
                    geolocation: geolocationDetails.name,
                    maxThreshold: maxThreshold,
                    currentData: elm.data,
                    flag: true,
                  }
                  sendEmail(store)
                  subUsers.forEach((user) => {
                    store["to"] = user.email;
                    store["userName"] = "user";
                    sendEmail(store);
                  })
                  sensorInLiveData.lastEmailSent = new Date();
                  await sensorInLiveData.save();
                  console.log("Email Sent For Max Threshold");
                }
                
              }
              return;
            }
          })
        })
      })
    })

    let findSensor = await LiveData.findOne({ sensorId: elm.id });
    if (findSensor) {
      // Limit to store the data of single sensor in database.
      if (findSensor.data.length >= 8000) {
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

// Getting all data from LiveData Model.
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
      csvWriter
        .writeRecords(records) // returns a promise
        .then(() => {
          console.log("...Done");
        });
      res.download("public/temp.csv");
      return;
    }, 2000);
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


// Get all the sensors
route.get("/getAllSensors", async (req, res) => {
  const data = await Sensor.find();
  return res.status(200).json(data);
});

module.exports = route;
