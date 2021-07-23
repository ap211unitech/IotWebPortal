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
        let allGeoLocations = await Geolocation.find({ user: req.user._id });
        console.log(allGeolocations)
        return res.status(200).json(allGeoLocations);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

module.exports = router;