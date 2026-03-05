const mongoose = require('mongoose');

const adsConfigSchema = new mongoose.Schema(
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
            enum: ['Banner', 'Interstitial', 'Rewarded'],
            required: true,
        },
        appId: { type: String, required: true },
        adUnitId: { type: String, required: true },
        rewardAmount: { type: String },
        placement: { type: String, required: true },
        frequency: { type: String, required: true },
        notes: { type: String },
    },
    { timestamps: true }
);

const AdsConfig = mongoose.model('AdsConfig', adsConfigSchema);
module.exports = AdsConfig;
