const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const Dashborad = require("../models/Dashboard");
const mongoose = require("mongoose");
const auth = require("../config/auth");

const storage = multer.diskStorage({
    destination: 'public/uploads',
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).fields([{
    name: "img",
    maxCount: 1
}
]);



// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|png|jpg/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only jpeg/png/jpg images applicable');
    }
}


//Post an article
router.post('/', auth, async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.json({
                msg: err
            });
        } else {
            if (req.files === undefined) {
                return res.json({
                    msg: 'Error: No File Selected!'
                });
            } else {
                let all_files = [];
                for (const key in req.files) {
                    all_files.push({ name: req.files[key][0].path.slice(7) });
                }
                try {
                    const data = new Dashborad({
                        image: all_files,
                        user: req.user._id
                    })
                    await data.save();
                    return res.status(200).redirect('/dashboard');

                } catch (err) {
                    return res.status(500).json({ msg: 'Internal Server Error' });
                }
            }
        }
    });
});


module.exports = router;