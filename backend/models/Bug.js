const mongoose = require('mongoose');

/**
 * Bug – QA bug report scoped to a game.
 * Media attachments (images/videos) stored as relative URL paths.
 */
const bugSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
            index: true,
        },
        // Short summary of the bug
        title: {
            type: String,
            required: [true, 'Please add a bug title'],
            trim: true,
        },
        // Where does the bug occur (screen / feature / flow)
        where: {
            type: String,
            trim: true,
            default: '',
        },
        // How to reproduce the bug
        how: {
            type: String,
            trim: true,
            default: '',
        },
        // Reproduction frequency
        frequency: {
            type: String,
            enum: ['Always', 'Often', 'Sometimes', 'Rarely'],
            required: [true, 'Please select a frequency'],
        },
        // Uploaded media – relative paths served via /uploads/bugs/
        media: [
            {
                url: { type: String },           // e.g. /uploads/bugs/bug-...jpg
                type: { type: String, enum: ['image', 'video'] },
            },
        ],
        // Team member the bug is assigned to (references TeamMember display card)
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TeamMember',
            required: [true, 'Please assign the bug to a team member'],
        },
        // The logged-in user who filed the bug
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // Workflow status
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Fixed', 'Closed', 'Wont Fix'],
            default: 'Open',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Bug', bugSchema);
