const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams for :gameId
const { getBugs, createBug, updateBug, deleteBug } = require('../controllers/bugController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure bug media upload dir exists
const bugDir = path.join(__dirname, '../uploads/bugs');
if (!fs.existsSync(bugDir)) fs.mkdirSync(bugDir, { recursive: true });

const bugUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, bugDir),
        filename: (req, file, cb) =>
            cb(null, `bug-${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB – videos can be large
    fileFilter: (req, file, cb) => {
        // Allow images and videos
        const ok = /image\/(jpeg|png|webp|gif)|video\/(mp4|quicktime|x-matroska|webm)/.test(file.mimetype);
        ok ? cb(null, true) : cb(new Error('Only images and videos are allowed'));
    },
});

// All routes require authentication; any user can CRUD bugs
router.get('/', protect, getBugs);
router.post('/', protect, bugUpload.array('media', 10), createBug);
router.patch('/:id', protect, bugUpload.array('media', 10), updateBug);
router.delete('/:id', protect, deleteBug);

module.exports = router;
