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
    origin: "http://10.2.77.151:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // Body parser



// Route files
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes'); // Primary router for games and nested entities
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRoutes);
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

// explicitly trigger nodemon restart
