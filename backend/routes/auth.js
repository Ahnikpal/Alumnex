const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
        return res.status(400).json({ error: 'Email, password, and userType are required' });
    }

    try {
        const table = userType === 'student' ? 'students' : 'alumni';
        const idField = userType === 'student' ? 'student_id' : 'alumni_id';
        
        const [rows] = await db.query(
            `SELECT * FROM ${table} WHERE email = ? AND password = ?`,
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        // Remove password from response
        delete user.password;

        res.json({
            message: 'Login successful',
            user: {
                ...user,
                id: user[idField],
                role: userType
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
