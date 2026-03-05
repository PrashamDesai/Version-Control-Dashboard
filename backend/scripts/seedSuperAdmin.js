/**
 * One-time seed script to create/update the default super admin account.
 * Usage: node backend/scripts/seedSuperAdmin.js
 *
 * This creates an account with phone: 9726733369 and role: super_admin.
 * If account already exists, it upgrades the role to super_admin.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/User');

const PHONE = '9726733369';
const DEFAULT_PASSWORD = 'SuperAdmin@123';
const NAME = 'Super Admin';

async function seed() {
    await connectDB();

    let user = await User.findOne({ phone: PHONE });

    if (user) {
        user.role = 'super_admin';
        // Unhash-safe direct update to avoid double-hashing
        if (!user.name || user.name === '') user.name = NAME;
        await User.updateOne({ phone: PHONE }, { role: 'super_admin' });
        console.log(`✓ Existing user (${PHONE}) upgraded to super_admin`);
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);
        await User.create({
            name: NAME,
            phone: PHONE,
            password: hashedPassword,
            role: 'super_admin',
        });
        console.log(`✓ Super admin created with phone: ${PHONE} and password: ${DEFAULT_PASSWORD}`);
    }

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
