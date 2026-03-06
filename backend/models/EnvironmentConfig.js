const mongoose = require('mongoose');
// Schema for environment-specific configurations

const environmentConfigSchema = new mongoose.Schema(
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
        bundleIdAndroid: { type: String },
        bundleIdiOS: { type: String },
        firebaseConsoleUrl: { type: String },
        googlePlayStatus: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
        appleStoreStatus: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
        appleSKU: { type: String },
        appleId: { type: String },
        appleDevelopmentProfile: { type: String },
        appleDistributionProfile: { type: String },
        firebaseClientId: { type: String },
        appId: { type: String },
        appName: { type: String },
        parentAccountAndroid: { type: String, default: '' },
        parentAccountAndroidUrl: { type: String, default: '' },
        parentAccountiOS: { type: String, default: '' },
        parentAccountiOSUrl: { type: String, default: '' },
        sdkIntegration: {
            firebaseAuth: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
            googleSignIn: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
            appleLogin: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
            crashlytics: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
            analytics: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
            fcm: { type: String, enum: ['Done', 'Pending', 'Not Required'] },
        },
        sdkDownloadUrls: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        customSdks: [
            {
                name: { type: String, required: true },
                status: { type: String, enum: ['Done', 'Pending', 'Not Required'], default: 'Not Required' },
                downloadUrl: { type: String }
            }
        ],
    },
    { timestamps: true }
);

// Prevent duplicate environments for the same game
environmentConfigSchema.index({ gameId: 1, environment: 1 }, { unique: true });

const EnvironmentConfig = mongoose.model('EnvironmentConfig', environmentConfigSchema);
module.exports = EnvironmentConfig;
// nodemon trigger
