const multer = require("multer");

// exports.upload = multer().none();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, "Project picture-"+uniqueSuffix+file.originalname);
  }
})

exports.upload = multer({ storage: storage }).fields([
    { name: 'file1', maxCount: 1},
    { name: 'file2', maxCount: 1},
    { name: 'file3', maxCount: 1},
])
// exports.upload = multer({ storage: storage }).array("file", 3)