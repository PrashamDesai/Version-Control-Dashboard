const mongoose = require('mongoose');

const storeListingSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
        },
        platform: { type: String, enum: ['Android', 'iOS'], required: true },

        // General Info
        title: { type: String }, // Title - Application Name
        shortDescription: { type: String }, // Short descxriooption (1 liner)
        longDescription: { type: String }, // long description (make i big)

        address: { type: String },
        postalCode: { type: String },

        // iOS Specific
        subtitle: { type: String },
        primaryLanguage: { type: String },
        primaryCategory: { type: String },
        preOrders: { type: String },
        countriesAvailable: { type: String },
        priceSchedule: { type: String },
        promotionalText: { type: String },
        keywords: { type: String },
        versionRelease: { type: String },
        tradeRepresentativeContactInfo: { type: String },
        doesAppRequireSignIn: { type: String },
        appleContentDescription: { type: String },
        additionalInfo: { type: String },

        // Android Specific
        projectApplicationName: { type: String },
        keyAlias: { type: String },
        password: { type: String },
        validityYears: { type: String },
        organizationalUnit: { type: String },
        cityLocality: { type: String },
        stateProvince: { type: String },
        countryCode: { type: String },
        defaultLanguage: { type: String },
        designProvidedByIndiaNIC: { type: String },
        applicationType: { type: String },
        gameCategory: { type: String }
    },
    { timestamps: true }
);

// Ensure a game can only have one listing per platform
storeListingSchema.index({ gameId: 1, platform: 1 }, { unique: true });

const StoreListing = mongoose.model('StoreListing', storeListingSchema);
module.exports = StoreListing;
