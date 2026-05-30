const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/logos';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Auto-migrate internships table
(async () => {
    try {
        console.log('--- Internships Auto-Migrate Starting ---');
        await db.query(`ALTER TABLE internships ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255) DEFAULT NULL`);
        await db.query(`ALTER TABLE internships ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL`);
        await db.query(`ALTER TABLE internships ADD COLUMN IF NOT EXISTS status ENUM('Active', 'Draft', 'Closed') DEFAULT 'Active'`);
        await db.query(`ALTER TABLE internships ADD COLUMN IF NOT EXISTS deadline DATE DEFAULT NULL`);
        console.log('--- Internships Auto-Migrate Finished ---');
    } catch (err) {
        console.error('Internships Auto-Migrate Error:', err.message);
    }
})();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/logos');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

// GET /internships  – return all internships with poster info and application count
router.get('/', async (req, res) => {
    try {
        // Now using the database VIEW for simplified complex joins and analytics (Week 5 requirement)
        const [rows] = await db.query(`
            SELECT * FROM v_internship_analytics
            ORDER BY internship_id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('GET /internships error:', err);
        res.status(500).json({ error: 'Failed to fetch internships', details: err.message });
    }
});

// GET /internships/:id  – return a single internship
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                i.*,
                a.name    AS posted_by_name,
                a.company AS posted_by_company,
                COUNT(ap.application_id) AS application_count
            FROM internships i
            LEFT JOIN alumni a ON i.posted_by = a.alumni_id
            LEFT JOIN applications ap ON i.internship_id = ap.internship_id
            WHERE i.internship_id = ?
            GROUP BY i.internship_id, a.alumni_id
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Internship not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /internships/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch internship', details: err.message });
    }
});

// POST /internships  – create a new internship listing with optional logo
router.post('/', upload.single('company_logo'), async (req, res) => {
    const { company, role, location, duration, stipend, posted_by, description, status, deadline } = req.body;
    let logo_url = null;

    if (req.file) {
        logo_url = `/uploads/logos/${req.file.filename}`;
    }

    if (!company || !role) {
        return res.status(400).json({ error: 'company and role are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO internships (company, role, location, duration, stipend, posted_by, logo_url, description, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [company, role, location ?? null, duration ?? null, stipend ?? null, posted_by ?? null, logo_url, description ?? null, status ?? 'Active', deadline ?? null]
        );
        res.status(201).json({ message: 'Internship created', internship_id: result.insertId, logo_url });
    } catch (err) {
        console.error('POST /internships error:', err);
        res.status(500).json({ error: 'Failed to create internship', details: err.message });
    }
});

// PATCH /internships/:id  – update any internship fields
router.patch('/:id', async (req, res) => {
    const { 
        company, role, location, duration, stipend, 
        description, status, deadline 
    } = req.body;
    
    const updates = [];
    const values = [];

    const fieldMap = {
        company, role, location, duration, stipend,
        description, status, deadline
    };

    for (const [key, value] of Object.entries(fieldMap)) {
        if (value !== undefined) {
            updates.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.params.id);

    try {
        const [result] = await db.query(
            `UPDATE internships SET ${updates.join(', ')} WHERE internship_id = ?`,
            values
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Internship not found' });
        res.json({ message: 'Internship updated' });
    } catch (err) {
        console.error('PATCH /internships/:id error:', err);
        res.status(500).json({ error: 'Failed to update internship', details: err.message });
    }
});

// DELETE /internships/:id  – delete an internship
router.delete('/:id', async (req, res) => {
    try {
        // Delete associated applications first
        await db.query('DELETE FROM applications WHERE internship_id = ?', [req.params.id]);
        // Delete associated referrals
        await db.query('DELETE FROM referrals WHERE internship_id = ?', [req.params.id]);

        const [result] = await db.query('DELETE FROM internships WHERE internship_id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Internship not found' });
        res.json({ message: 'Internship deleted' });
    } catch (err) {
        console.error('DELETE /internships/:id error:', err);
        res.status(500).json({ error: 'Failed to delete internship', details: err.message });
    }
});

module.exports = router;
