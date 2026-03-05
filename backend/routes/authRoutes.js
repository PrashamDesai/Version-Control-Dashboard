const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleAuth, getMe, updateProfile, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        /jpg|jpeg|png|webp/.test(file.mimetype) ? cb(null, true) : cb(new Error('Images only'));
    },
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.patch('/profile', protect, avatarUpload.single('avatar'), updateProfile);
router.delete('/delete', protect, deleteAccount);

module.exports = router;
