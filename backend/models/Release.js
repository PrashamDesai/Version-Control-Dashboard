const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
        },
        releaseNumber: {
            type: Number,
            required: true,
        },
        platform: {
            type: String,
            enum: ['Android', 'iOS'],
            required: true,
        },
        versionName: {
            type: String,
            required: true,
        },
        buildNumber: {
            type: Number,
            required: true,
        },
        whatsNew: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Live', 'In Review', 'Waiting for Review', 'In Closed Testing', 'In Internal Testing', 'Rejected'],
            default: 'In Internal Testing',
        },
        releaseDate: {
            type: Date,
        },
        softDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Release = mongoose.model('Release', releaseSchema);
module.exports = Release;
