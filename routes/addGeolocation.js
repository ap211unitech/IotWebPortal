const router = require("express").Router();
const Geolocation = require("../models/GeoLocations");
const auth = require("../config/auth");

// Add new geolocation
router.post('/addGeolocation', auth, async (req, res) => {
    try {
        const { name, location, latitude, longitude } = req.body;
        const NewGeoLocation = new Geolocation({
            user: req.user._id,
            name,
            location,
            latitude,
            longitude
        })

        await NewGeoLocation.save();
        return res.status(201).json({ NewGeoLocation, status: 201 });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

// Get geolocations by user id
router.get('/getGeolocations', auth, async (req, res) => {
    try {
        const allGeoLocations = await Geolocation.find({ user: req.user._id });
        // console.log(allGeoLocations)
        if (allGeoLocations.length == 0) {
            return res.status(200).json({ msg: 'No geolocation found', status: 404 });
        }
        return res.status(200).json({ allGeoLocations, status: 200 });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

module.exports = router;