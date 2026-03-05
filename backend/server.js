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

// Middleware
app.use(cors({
    origin: ["https://version-control-dashboard.onrender.com", "https://version-control-dashboard-1.onrender.com"]
}));
app.use(express.json()); // Body parser

// Make uploads folder static to serve images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes'); // Now acts as primary router for game entities

// Game-specific routes (nested under games)
const releaseRoutes = require('./routes/releaseRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const linkRoutes = require('./routes/linkRoutes');
const adsConfigRoutes = require('./routes/adsRoutes');
const buildChecklistRoutes = require('./routes/checklistRoutes');
const storeRoutes = require('./routes/storeRoutes');
const closedTestRoutes = require('./routes/closedTestRoutes');
const firestoreRulesRoutes = require('./routes/firestoreRulesRoutes');
const adPlacementsRoutes = require('./routes/adPlacementsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const bugRoutes = require('./routes/bugRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes); // Nested routing handles the rest
app.use('/api/games/:gameId/releases', releaseRoutes);
app.use('/api/games/:gameId/environments', environmentRoutes);
app.use('/api/games/:gameId/links', linkRoutes);
app.use('/api/games/:gameId/ads', adsConfigRoutes);
app.use('/api/games/:gameId/ad-placements', adPlacementsRoutes);
app.use('/api/games/:gameId/checklist', buildChecklistRoutes);
app.use('/api/games/:gameId/store', storeRoutes);
app.use('/api/games/:gameId/closed-test', closedTestRoutes);
app.use('/api/games/:gameId/firestore-rules', firestoreRulesRoutes);
app.use('/api/games/:gameId/bugs', bugRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);

// General route
app.get('/', (req, res) => {
    res.send('Version Control Dashboard API is running...');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});