const express = require('express');
const router = express.Router();
const Image = require("../models/Image");
const Sensor = require("../models/Sensor");
const auth = require("../config/auth");

router.post('/', auth, async (req, res) => {
    const { imageId, sensorId, sensorName, latitude, longitude, category, hRatio, vRatio } = req.body;
    try {
        const findUser = await Sensor.findOne({ user: req.user._id });

        if (findUser) { // If user found in sensor database 

            // If it is already present, mean we are add new sensor for any previou image.
            const findImageIndex = findUser.sensor.findIndex(elm => elm.image.toString() === imageId)

            if (findImageIndex >= 0) {
                const findSensorIndex = findUser.sensor[findImageIndex].sensorDetail.findIndex(elm => elm.sensorId === sensorId);

                if (findSensorIndex >= 0) {
                    // In this, we are actually updating a sesnor detail using their sensorId.
                    const sensorArray =
                    {
                        sensorId: sensorId,
                        sensorName: sensorName,
                        category: category,
                        latitude: latitude,
                        longitude: longitude,
                        imageCoordinates:
                        {
                            hRatio: hRatio,
                            vRatio: vRatio,
                        }
                    }

                    findUser.sensor[findImageIndex].sensorDetail = sensorArray;
                    await findUser.save();
                    return res.status(202).json(findUser);
                }

                else {
                    const sensorArray =
                    {
                        sensorId: sensorId,
                        sensorName: sensorName,
                        category: category,
                        latitude: latitude,
                        longitude: longitude,
                        imageCoordinates:
                        {
                            hRatio: hRatio,
                            vRatio: vRatio,
                        }

                    }

                    findUser.sensor[findImageIndex].sensorDetail.unshift(sensorArray);
                    await findUser.save();
                    return res.status(202).json(findUser);
                }
            }
            else {
                const sensorArray =
                {
                    image: imageId,
                    sensorDetail: [
                        {
                            sensorId: sensorId,
                            sensorName: sensorName,
                            category: category,
                            latitude: latitude,
                            longitude: longitude,
                            imageCoordinates:
                            {
                                hRatio: hRatio,
                                vRatio: vRatio,
                            }

                        }
                    ]
                }

                findUser.sensor.unshift(sensorArray);
                await findUser.save();
                return res.status(202).json(findUser);
            }
        }
        else {
            const sensorArray = [
                {
                    image: imageId,
                    sensorDetail: [
                        {
                            sensorId: sensorId,
                            sensorName: sensorName,
                            category: category,
                            latitude: latitude,
                            longitude: longitude,
                            imageCoordinates:
                            {
                                hRatio: hRatio,
                                vRatio: vRatio,
                            }

                        }
                    ]
                }
            ];

            const newSensor = new Sensor({
                user: req.user._id,
                sensor: sensorArray
            })
            await newSensor.save();
            return res.status(201).json(newSensor);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: 'Internal Server Error' });
    }

})

module.exports = router;