const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const allowedOrigins = [
    'http://localhost:5173', // Local development
    'http://localhost:3000',
    'https://resonant-florentine-05f423.netlify.app', // Production Netlify frontend
    process.env.FRONTEND_URL // Fallback env variable
].filter(Boolean);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json()); // Body parser

// Make uploads folder static to serve images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes'); // Primary router for games and nested entities
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);

// General route
app.get('/', (req, res) => {
    res.send('EchoGames API is running... v2');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

