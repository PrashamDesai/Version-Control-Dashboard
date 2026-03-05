const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['Firebase', 'Store', 'Design', 'Testing', 'Other'],
            required: true,
        },
        environment: {
            type: String,
            enum: ['DEV', 'QA', 'PROD', ''],
            default: '',
        },
    },
    { timestamps: true }
);

const Link = mongoose.model('Link', linkSchema);
module.exports = Link;
