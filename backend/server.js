const express = require('express');
const cors = require('cors');
require('dotenv').config();

const studentsRouter = require('./routes/students');
const alumniRouter = require('./routes/alumni');
const internshipsRouter = require('./routes/internships');
const applicationsRouter = require('./routes/applications');
const referralsRouter = require('./routes/referrals');
const authRouter = require('./routes/auth');
const notificationsRouter = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ── Health check ────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Alumnex API is running 🚀',
        version: '1.0.0',
    });
});

// ── Routes ──────────────────────────────────────────────────
app.use('/students', studentsRouter);
app.use('/alumni', alumniRouter);
app.use('/internships', internshipsRouter);
app.use('/applications', applicationsRouter);
app.use('/referrals', referralsRouter);
app.use('/auth', authRouter);
app.use('/notifications', notificationsRouter);

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Alumnex backend running on http://localhost:${PORT}`);
});
