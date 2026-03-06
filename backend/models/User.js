const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // Allows null/undefined to not conflict with unique
        },
        password: {
            type: String, // Made optional for Google Auth users
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        avatarUrl: {
            type: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'super_admin'],
            default: 'user',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password Method
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
