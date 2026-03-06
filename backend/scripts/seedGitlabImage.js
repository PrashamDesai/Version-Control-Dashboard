const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Image = require('../models/Image');

// 1. Setup environment
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

const seedImage = async () => {
    await connectDB();

    const imagePath = path.join(__dirname, '../uploads/gitlab-enterprise.png');

    if (!fs.existsSync(imagePath)) {
        console.error('Image file not found at:', imagePath);
        process.exit(1);
    }

    const data = fs.readFileSync(imagePath);
    const contentType = 'image/png';
    const filename = 'gitlab-enterprise.png';

    try {
        // Upsert the image
        let image = await Image.findOne({ filename });

        if (image) {
            console.log('Image already exists, updating...');
            image.data = data;
            image.contentType = contentType;
            await image.save();
        } else {
            console.log('Creating new image record...');
            image = await Image.create({
                filename,
                contentType,
                data
            });
        }

        console.log('GitLab Logo seeded successfully!');
        console.log('IMAGE_ID:', image._id.toString());
        process.exit(0);
    } catch (err) {
        console.error('Error seeding image:', err.message);
        process.exit(1);
    }
};

seedImage();
