const mongoose = require('mongoose');

const buildChecklistSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
        },
        environment: {
            type: String,
            enum: ['DEV', 'QA', 'PROD'],
            required: true,
            default: 'PROD' // For simplicity right now, assuming PROD CBD
        },
        platform: {
            type: String,
            enum: ['Android', 'iOS', 'All'],
            required: true,
            default: 'All'
        },
        checkName: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Completed', 'Remaining', 'Attention', 'N/A'],
            default: 'Remaining',
        },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

const BuildChecklist = mongoose.model('BuildChecklist', buildChecklistSchema);
module.exports = BuildChecklist;
