const router = require("express").Router();
const Geolocation = require("../models/GeoLocations");
const Image = require("../models/Image");
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
router.post('/getGeolocations', auth, async (req, res) => {
    try {
        if (req.user.type == "admin") {
            const allGeoLocations = await Geolocation.find();
            // console.log(allGeoLocations)
            if (allGeoLocations.length == 0) {
                return res.status(200).json({ msg: 'No geolocation found', status: 404 });
            }
            return res.status(200).json({ allGeoLocations, status: 200 });
        }
        else if (req.user.type == "orghead") {
            const allGeoLocations = await Geolocation.find({ user: req.user._id });
            // console.log(allGeoLocations)
            if (allGeoLocations.length == 0) {
                return res.status(200).json({ msg: 'No geolocation found', status: 404 });
            }
            return res.status(200).json({ allGeoLocations, status: 200 });
        }
        else {
            const allGeoLocations = await Geolocation.find({ user: req.body.parent });
            // console.log(allGeoLocations)
            if (allGeoLocations.length == 0) {
                return res.status(200).json({ msg: 'No geolocation found', status: 404 });
            }
            return res.status(200).json({ allGeoLocations, status: 200 });
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

// Get Geolocation user by geolocation id
router.post('/getUserIdbyGeoId', auth, async (req, res) => {
    try {
        const user = await Geolocation.findById(req.body.id);
        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
})

// Delete geolocation and delete image,sensor and other data
router.delete('/deleteGeolocation', auth, async (req, res) => {
    const { geoId, user } = req.body;
    console.log(geoId, user, "DELETE")
    try {
        // Delete Geolocation
        const deleteGeo = await Geolocation.deleteOne({ user: user, _id: geoId });
        return res.status(200).json({ msg: 'Geolocation deleted' });
        // Delete Image
        // const findUser = await Image.findOne({ user });
        // if (!findUser) {
        //     console.log("no find user")
        //     return;
        // }
        // const ImageArray = findUser.image;
        // const index = ImageArray.find(data => data.geolocation.toString() == geoId);
        // findUser.image.splice(index, 1);
        // await findUser.save();

    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})


module.exports = router;