const mongoose = require('mongoose');

/**
 * TeamMember – stores admin-managed team card data.
 * Intentionally separate from the User auth record.
 * linkedUserId (optional) lets the UI mark a card as "currently online"
 * when a matching user is logged in.
 */
const teamMemberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,   // Display role/title e.g. "Lead Developer"
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        photoUrl: {
            type: String,   // Path to uploaded photo or external URL
        },
        linkedUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,  // If set, card highlights when that user is logged in
        },
        order: {
            type: Number,
            default: 0,     // For manual sort ordering
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TeamMember', teamMemberSchema);
