const express = require('express');
const router = express.Router();
const { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } = require('../controllers/teamController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const teamUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        /jpg|jpeg|png|webp/.test(file.mimetype) ? cb(null, true) : cb(new Error('Images only'));
    },
});

// All users can view; only admin/super_admin can mutate
router.get('/', protect, getTeamMembers);
router.post('/', protect, admin, teamUpload.single('photo'), createTeamMember);
router.patch('/:id', protect, admin, teamUpload.single('photo'), updateTeamMember);
router.delete('/:id', protect, admin, deleteTeamMember);

module.exports = router;
