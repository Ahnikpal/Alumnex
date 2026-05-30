const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const profilesDir = 'uploads/profiles';
if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'alumni-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) return cb(null, true);
        cb(new Error('Only images are allowed'));
    }
});

console.log('--- Alumni Router File Loaded ---');

// Auto-migrate
(async () => {
    try {
        await db.query(`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255) DEFAULT NULL`);
        await db.query(`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL`);
        await db.query(`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS skills TEXT DEFAULT NULL`);
        await db.query(`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) DEFAULT NULL`);
    } catch (e) {}
})();

// GET /alumni  – return all alumni
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT alumni_id, name, email, company, role, graduation_year, location, linkedin, bio, skills, profile_picture, created_at FROM alumni'
        );
        res.json(rows);
    } catch (err) {
        console.error('GET /alumni error:', err);
        res.status(500).json({ error: 'Failed to fetch alumni', details: err.message });
    }
});

// POST /alumni  – create a new alumni record
router.post('/', async (req, res) => {
    const { name, email, password, company, role, graduation_year, location } = req.body;

    if (!name || !email || !password || !company || !role) {
        return res.status(400).json({ error: 'name, email, password, company, and role are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO alumni (name, email, password, company, role, graduation_year, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, password, company, role, graduation_year ?? null, location ?? null]
        );
        res.status(201).json({ message: 'Alumni created', alumni_id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'An alumni with this email already exists' });
        }
        console.error('POST /alumni error:', err);
        res.status(500).json({ error: 'Failed to create alumni', details: err.message });
    }
});

// PATCH or PUT /alumni/:id  – update editable profile fields
router.route('/:id')
    .patch(async (req, res) => {
        await updateAlumni(req, res);
    })
    .put(async (req, res) => {
        await updateAlumni(req, res);
    })
    .get(async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT alumni_id, name, email, company, role, graduation_year, location, linkedin, bio, skills, profile_picture, created_at FROM alumni WHERE alumni_id = ?',
                [req.params.id]
            );
            if (rows.length === 0) return res.status(404).json({ error: 'Alumni not found' });
            res.json(rows[0]);
        } catch (err) {
            console.error('GET /alumni/:id error:', err);
            res.status(500).json({ error: 'Failed to fetch alumni', details: err.message });
        }
    });

// POST /alumni/:id/upload - upload profile picture
router.post('/:id/upload', upload.single('profile_picture'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        await db.query('UPDATE alumni SET profile_picture = ? WHERE alumni_id = ?', [imageUrl, req.params.id]);
        
        res.json({ message: 'Profile picture uploaded', profile_picture: imageUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

async function updateAlumni(req, res) {
    const { name, company, role, graduation_year, location, linkedin, bio, skills } = req.body;
    const allowed = { name, company, role, graduation_year, location, linkedin, bio, skills };

    // Build dynamic SET clause from only provided fields
    const fields = Object.entries(allowed).filter(([, v]) => v !== undefined);
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields provided to update' });
    }

    const setClause = fields.map(([k]) => `${k} = ?`).join(', ');
    const values = [...fields.map(([, v]) => v), req.params.id];

    try {
        const [result] = await db.query(
            `UPDATE alumni SET ${setClause} WHERE alumni_id = ?`,
            values
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Alumni not found' });
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update alumni', details: err.message });
    }
}

module.exports = router;
