const mongoose = require('mongoose');

const adPlacementSchema = new mongoose.Schema(
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
        },
        platform: {
            type: String,
            enum: ['Android', 'iOS'],
            required: true,
        },
        adType: {
            type: String,
            enum: ['Banner', 'Interstitial', 'Rewarded', 'App Open', 'Native'],
            required: true,
        },
        placement: { type: String, required: true },
        frequency: { type: String, required: true },
        notes: { type: String },
    },
    { timestamps: true }
);

const AdPlacement = mongoose.model('AdPlacement', adPlacementSchema);
module.exports = AdPlacement;
