const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /notifications - fetch notifications for a user
router.get('/', async (req, res) => {
    const { user_id, user_type } = req.query;

    if (!user_id || !user_type) {
        return res.status(400).json({ error: 'user_id and user_type are required' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? AND user_type = ? ORDER BY created_at DESC LIMIT 50',
            [user_id, user_type]
        );
        res.json(rows);
    } catch (err) {
        console.error('GET /notifications error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }
});

// PATCH /notifications/:id/read - mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const [result] = await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Notification not found' });
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('PATCH /notifications/:id/read error:', err);
        res.status(500).json({ error: 'Failed to update notification', details: err.message });
    }
});

// PATCH /notifications/read-all - mark all as read
router.patch('/read-all', async (req, res) => {
    const { user_id, user_type } = req.body;
    if (!user_id || !user_type) return res.status(400).json({ error: 'user_id and user_type required' });

    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND user_type = ?',
            [user_id, user_type]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('PATCH /notifications/read-all error:', err);
        res.status(500).json({ error: 'Failed to update notifications', details: err.message });
    }
});

module.exports = router;
