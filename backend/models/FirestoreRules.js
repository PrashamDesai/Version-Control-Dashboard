const mongoose = require('mongoose');

const firestoreRulesSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
            unique: true,
        },
        productionRules: {
            type: String,
            default: '',
        },
        developmentRules: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

const FirestoreRules = mongoose.model('FirestoreRules', firestoreRulesSchema);
module.exports = FirestoreRules;
