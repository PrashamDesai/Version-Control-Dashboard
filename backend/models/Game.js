const mongoose = require('mongoose');
const slugify = require('slugify');

const gameSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        description: {
            type: String,
        },
        iconUrl: {
            type: String,
        },
        platformsSupported: [
            {
                type: String,
                enum: ['Android', 'iOS'],
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        // App store / release lifecycle status
        status: {
            type: String,
            enum: ['Live', 'In Review', 'Waiting for Review', 'In Closed Testing', 'In Internal Testing'],
            default: 'In Internal Testing',
        },
        // Public store listing URLs (only relevant when game is live)
        playStoreUrl: { type: String, default: '' },
        appStoreUrl: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug before save
gameSchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

// Cascade delete related data
gameSchema.pre('deleteOne', { document: true, query: false }, async function () {
    const gameId = this._id;
    await mongoose.model('Release').deleteMany({ gameId });
    await mongoose.model('EnvironmentConfig').deleteMany({ gameId });
    await mongoose.model('AdsConfig').deleteMany({ gameId });
    await mongoose.model('BuildChecklist').deleteMany({ gameId });
    await mongoose.model('StoreListing').deleteMany({ gameId });
    await mongoose.model('ClosedTestReport').deleteMany({ gameId });
    await mongoose.model('Link').deleteMany({ gameId });
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
