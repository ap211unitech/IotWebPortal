const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

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
router.post('/', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err)
            return res.json({
                msg: err
            });
        } else {
            if (req.files === undefined || req.files === {}) {
                return res.json({
                    msg: 'Error: No File Selected!'
                });
            } else {
                let all_files = [];
                for (const key in req.files) {
                    let obj = { [key]: req.files[key][0] }
                    all_files.push(obj);
                }
                return res.status(200).render('dashboard.ejs', {
                    file: all_files[0].img.path.slice(7)
                });
            }
        }
    });
});


module.exports = router;