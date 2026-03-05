const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Multer Config: Use Memory Storage to keep files in a Buffer
const storage = multer.memoryStorage();

// File validation
function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only (jpeg, png, webp)!'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
