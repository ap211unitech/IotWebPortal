const express = require('express');
const router = express.Router();
const Image = require("../models/Image");
const Sensor = require("../models/Sensor");
const auth = require("../config/auth");

// @ Add / Edit sensor
router.post('/addSensor', auth, async (req, res) => {
    const { imageId, sensorId, sensorName, latitude, longitude, category, hRatio, vRatio, geolocation } = req.body;
    try {
        const findUser = await Sensor.findOne({ user: req.user._id });

        if (findUser) { // If user found in sensor database 

            // If it is already present, means we will search for geolocation.
            const findGeoLocationIndex = findUser.sensor.findIndex(elm => elm.geolocation.toString() === geolocation);

            if (findGeoLocationIndex >= 0) {
                // If it is already present, mean we are add new sensor for any previous image.
                const findImageIndex = findUser.sensor[findGeoLocationIndex].data.findIndex(elm => elm.image.toString() === imageId);

                if (findImageIndex >= 0) {
                    const findSensorIndex = findUser.sensor[findGeoLocationIndex].data[findImageIndex].sensorDetail.findIndex(elm => elm.sensorId === sensorId);

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

                        findUser.sensor[findGeoLocationIndex].data[findImageIndex].sensorDetail[findSensorIndex] = sensorArray;
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

                        findUser.sensor[findGeoLocationIndex].data[findImageIndex].sensorDetail.unshift(sensorArray);
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

                    findUser.sensor[findGeoLocationIndex].data.unshift(sensorArray);
                    await findUser.save();
                    return res.status(202).json(findUser);
                }
            }
            else {
                const sensorArray =
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
                                imageCoordinates:
                                {
                                    hRatio: hRatio,
                                    vRatio: vRatio,
                                }

                            }
                        ]
                    }
                };
                findUser.sensor.unshift(sensorArray);
                await findUser.save();
                return res.status(202).json(findUser);
            }
        }
        else {
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
                                imageCoordinates:
                                {
                                    hRatio: hRatio,
                                    vRatio: vRatio,
                                }

                            }
                        ]
                    }
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

// @ Get Sesnor Details for a user
router.get('/getSensor', auth, async (req, res) => {
    try {
        const findSensor = await Sensor.find({ user: req.user._id });
        return res.status(200).json(findSensor);
    } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})

module.exports = router;