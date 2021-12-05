const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
const Sensor = require("../models/Sensor");
const auth = require("../config/auth");
const LiveData = require("../models/LiveData");

// @ Add / Edit sensor
router.post("/addSensor", auth, async (req, res) => {
  console.log(req.body);
  const {
    imageId,
    sensorId,
    sensorName,
    latitude,
    longitude,
    category,
    hRatio,
    vRatio,
    geolocation,
    location,
    sensorType,
  } = req.body;
  try {
    const findUser = await Sensor.findOne({ user: req.user._id });

    if (findUser) {
      // If user found in sensor database

      // If it is already present, means we will search for geolocation.
      const findGeoLocationIndex = findUser.sensor.findIndex(
        (elm) => elm.geolocation.toString() === geolocation
      );

      if (findGeoLocationIndex >= 0) {
        // If it is already present, mean we are add new sensor for any previous image.
        const findImageIndex = findUser.sensor[
          findGeoLocationIndex
        ].data.findIndex((elm) => elm.image.toString() === imageId);

        if (findImageIndex >= 0) {
          const findSensorIndex = findUser.sensor[findGeoLocationIndex].data[
            findImageIndex
          ].sensorDetail.findIndex((elm) => elm.sensorId === sensorId);

          if (findSensorIndex >= 0) {
            // In this, we are actually updating a sesnor detail using their sensorId.
            const sensorArray = {
              sensorId: sensorId,
              sensorName: sensorName,
              category: category,
              latitude: latitude,
              longitude: longitude,
              imageCoordinates: {
                hRatio: hRatio,
                vRatio: vRatio,
              },
              location: location,
              sensorType: sensorType,
            };

            findUser.sensor[findGeoLocationIndex].data[
              findImageIndex
            ].sensorDetail[findSensorIndex] = sensorArray;
            await findUser.save();
            return res.status(202).json(findUser);
          } else {
            const sensorArray = {
              sensorId: sensorId,
              sensorName: sensorName,
              category: category,
              latitude: latitude,
              longitude: longitude,
              imageCoordinates: {
                hRatio: hRatio,
                vRatio: vRatio,
              },
              location: location,
              sensorType: sensorType,
            };
            findUser.sensor[findGeoLocationIndex].data[
              findImageIndex
            ].sensorDetail.unshift(sensorArray);
            await findUser.save();
            return res.status(202).json(findUser);
          }
        } else {
          const sensorArray = {
            image: imageId,
            sensorDetail: [
              {
                sensorId: sensorId,
                sensorName: sensorName,
                category: category,
                latitude: latitude,
                longitude: longitude,
                imageCoordinates: {
                  hRatio: hRatio,
                  vRatio: vRatio,
                },
                location: location,
                sensorType: sensorType,
              },
            ],
          };

          findUser.sensor[findGeoLocationIndex].data.unshift(sensorArray);
          await findUser.save();
          return res.status(202).json(findUser);
        }
      } else {
        const sensorArray = {
          geolocation: geolocation,
          data: {
            image: imageId,
            sensorDetail: [
              {
                sensorId: sensorId,
                sensorName: sensorName,
                category: category,
                latitude: latitude,
                longitude: longitude,
                imageCoordinates: {
                  hRatio: hRatio,
                  vRatio: vRatio,
                },
                location: location,
                sensorType: sensorType,
              },
            ],
          },
        };
        findUser.sensor.unshift(sensorArray);
        await findUser.save();
        return res.status(202).json(findUser);
      }
    } else {
      const sensorArray = [
        {
          geolocation: geolocation,
          data: {
            image: imageId,
            sensorDetail: [
              {
                sensorId: sensorId,
                sensorName: sensorName,
                category: category,
                latitude: latitude,
                longitude: longitude,
                imageCoordinates: {
                  hRatio: hRatio,
                  vRatio: vRatio,
                },
                location: location,
                sensorType: sensorType,
              },
            ],
          },
        },
      ];

      const newSensor = new Sensor({
        user: req.user._id,
        sensor: sensorArray,
      });
      await newSensor.save();
      return res.status(201).json(newSensor);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

// @ Get Sesnor Details for a geolcation
router.post("/getSensorgeolocation", auth, async (req, res) => {
  try {
    let user;
    if (req.user.type == "orghead") {
      user = req.user._id;
    } else {
      user = req.body.user;
    }
    // if (req.user.type == "admin") {
    //     user = req.body.user;
    //     const geolocationId = req.body.geolocation;
    //     const findSensor = await Sensor.findOne({ user: req.body.user });

    //     if (!findSensor) {
    //         return res.status(200).json({ msg: 'No user found', status: 400 })
    //     }

    //     const allSensor = findSensor.sensor;
    //     const sensorForGeolocation = allSensor.filter(elm => elm.geolocation.toString() == geolocationId);
    //     return res.status(200).json(sensorForGeolocation);
    // }

    const geolocationId = req.body.geolocation;
    const findSensor = await Sensor.findOne({ user });

    console.log(user, findSensor);

    if (!findSensor) {
      return res.status(200).json({ msg: "No user found", status: 400 });
    }

    const allSensor = findSensor.sensor;
    const sensorForGeolocation = allSensor.filter(
      (elm) => elm.geolocation.toString() == geolocationId
    );
    return res.status(200).json(sensorForGeolocation);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});


// @ Put Threshold values in Sensor
router.put("/emailalert", auth, async (req, res) => {
  const { geolocation, imageId, sensorId, geoUser, maxThreshold, minThreshold } = req.body;
  try {
    let user = null;
    if (req.user.type == "admin") {
      user = req.body.geoUser;
    } else {
      user = req.user._id;
    }

    const findUser = await Sensor.findOne({ user });

    if (findUser) {
      // If user found in sensor database

      // If it is already present, means we will search for geolocation.
      const findGeoLocationIndex = findUser.sensor.findIndex(
        (elm) => elm.geolocation.toString() === geolocation
      );

      if (findGeoLocationIndex >= 0) {

        // If it is already present, mean we are add new sensor for any previous image.
        const findImageIndex = findUser.sensor[
          findGeoLocationIndex
        ].data.findIndex((elm) => elm.image.toString() === imageId);

        if (findImageIndex >= 0) {

          const findSensorIndex = findUser.sensor[findGeoLocationIndex].data[
            findImageIndex
          ].sensorDetail.findIndex((elm) => elm._id.toString() === sensorId);

          if (findSensorIndex >= 0) {

            findUser.sensor[findGeoLocationIndex].data[
              findImageIndex
            ].sensorDetail[findSensorIndex].minThreshold = minThreshold;

            findUser.sensor[findGeoLocationIndex].data[
              findImageIndex
            ].sensorDetail[findSensorIndex].maxThreshold = maxThreshold;

            await findUser.save();
            
            return res.status(200).json({ msg: "Threshold value updated....", status: 200 });
          } else {
            return res
              .status(200)
              .json({ msg: "Sensor not found", status: 400 });
          }
        } else {
          return res
            .status(200)
            .json({ msg: "Image not found for such geolocation", status: 400 });
        }
      } else {
        return res
          .status(200)
          .json({ msg: "No such geolocation found", status: 400 });
      }
    } else {
      return res.status(200).json({ msg: "No user found", status: 400 });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
})


// @ Get Sesnor Details for a user
router.get("/getSensor", auth, async (req, res) => {
  try {
    const findSensor = await Sensor.findOne({ user: req.user._id });
    return res.status(200).json(findSensor);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

// @ Delete Sensor Details for a user
router.delete("/deleteSensor", auth, async (req, res) => {
  const { geolocation, imageId, sensorId, sensorIdUUID } = req.body;
  try {
    let user = null;
    if (req.user.type == "admin") {
      user = req.body.geoUser;
    } else {
      user = req.user._id;
    }
    const findUser = await Sensor.findOne({ user });

    if (findUser) {
      // If user found in sensor database

      // If it is already present, means we will search for geolocation.
      const findGeoLocationIndex = findUser.sensor.findIndex(
        (elm) => elm.geolocation.toString() === geolocation
      );

      if (findGeoLocationIndex >= 0) {
        // If it is already present, mean we are add new sensor for any previous image.
        const findImageIndex = findUser.sensor[
          findGeoLocationIndex
        ].data.findIndex((elm) => elm.image.toString() === imageId);

        if (findImageIndex >= 0) {
          const findSensorIndex = findUser.sensor[findGeoLocationIndex].data[
            findImageIndex
          ].sensorDetail.findIndex((elm) => elm._id.toString() === sensorId);

          if (findSensorIndex >= 0) {
            findUser.sensor[findGeoLocationIndex].data[
              findImageIndex
            ].sensorDetail.splice(findSensorIndex, 1);

            await findUser.save();
            // Delete from LiveData Model also
            await LiveData.deleteOne({ sensorId: sensorIdUUID });

            return res.status(200).json({ msg: "Sensor Deleted", status: 200 });
          } else {
            return res
              .status(200)
              .json({ msg: "Sensor not found", status: 400 });
          }
        } else {
          return res
            .status(200)
            .json({ msg: "Image not found for such geolocation", status: 400 });
        }
      } else {
        return res
          .status(200)
          .json({ msg: "No such geolocation found", status: 400 });
      }
    } else {
      return res.status(200).json({ msg: "No user found", status: 400 });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
