const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Auto-migrate students table
(async () => {
    try {
        console.log('--- Students Auto-Migrate Starting ---');
        
        // Ensure Normalized Tables Exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS colleges (
                college_id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(200) NOT NULL UNIQUE,
                location VARCHAR(100) DEFAULT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (college_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS branches (
                branch_id    INT          NOT NULL AUTO_INCREMENT,
                name         VARCHAR(100) NOT NULL,
                department   VARCHAR(100) DEFAULT NULL,
                PRIMARY KEY (branch_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Migration: Add normalized columns
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS college_id INT DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS branch_id INT DEFAULT NULL`);
        
        // Add existing identity columns
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS about_me TEXT DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS skills VARCHAR(255) DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS github_link VARCHAR(255) DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS linkedin_link VARCHAR(255) DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS portfolio_link VARCHAR(150) DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS resume_url VARCHAR(255) DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) DEFAULT NULL`);
        await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS identity_url VARCHAR(255) DEFAULT NULL`);
        
        console.log('--- Students Auto-Migrate Finished ---');
    } catch (err) {
        console.error('Students Auto-Migrate Error:', err.message);
    }
})();

// Ensure uploads directories exist
const uploadDirs = ['uploads/profiles', 'uploads/identity', 'uploads/resumes'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profile_picture') {
            cb(null, 'uploads/profiles');
        } else if (file.fieldname === 'resume') {
            cb(null, 'uploads/resumes');
        } else {
            cb(null, 'uploads/identity');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed'));
    }
});

// POST /students/:id/upload - upload profile picture, identity, or resume
router.post('/:id/upload', upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'identity_url', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};
        
        if (req.files['profile_picture']) {
            updates.profile_picture = `/uploads/profiles/${req.files['profile_picture'][0].filename}`;
        }
        if (req.files['identity_url']) {
            updates.identity_url = `/uploads/identity/${req.files['identity_url'][0].filename}`;
        }
        if (req.files['resume']) {
            updates.resume_url = `/uploads/resumes/${req.files['resume'][0].filename}`;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const [result] = await db.query(
            `UPDATE students SET 
                profile_picture = COALESCE(?, profile_picture),
                identity_url = COALESCE(?, identity_url),
                resume_url = COALESCE(?, resume_url)
            WHERE student_id = ?`,
            [updates.profile_picture || null, updates.identity_url || null, updates.resume_url || null, id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
        
        res.json({ 
            message: 'Files uploaded successfully', 
            profile_picture: updates.profile_picture,
            identity_url: updates.identity_url,
            resume_url: updates.resume_url
        });
    } catch (err) {
        console.error('POST /students/:id/upload error:', err);
        res.status(500).json({ error: 'Failed to upload files', details: err.message });
    }
});

// GET /students  – return all students with normalized joins (excluding password)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                s.student_id, s.name, s.email, 
                c.name AS college, b.name AS branch, 
                s.cgpa, s.location, s.about_me, s.skills, 
                s.github_link, s.linkedin_link, s.portfolio_link, 
                s.resume_url, s.profile_picture, s.identity_url, 
                s.created_at 
            FROM students s
            LEFT JOIN colleges c ON s.college_id = c.college_id
            LEFT JOIN branches b ON s.branch_id = b.branch_id
        `);
        res.json(rows);
    } catch (err) {
        console.error('GET /students error:', err);
        res.status(500).json({ error: 'Failed to fetch students', details: err.message });
    }
});

// GET /students/:id  – return a single student with normalized joins
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                s.student_id, s.name, s.email, 
                c.name AS college, b.name AS branch, 
                s.cgpa, s.location, s.about_me, s.skills, 
                s.github_link, s.linkedin_link, s.portfolio_link, 
                s.resume_url, s.profile_picture, s.identity_url, 
                s.created_at 
            FROM students s
            LEFT JOIN colleges c ON s.college_id = c.college_id
            LEFT JOIN branches b ON s.branch_id = b.branch_id
            WHERE s.student_id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /students/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch student', details: err.message });
    }
});

// POST /students  – create a new student (handles both legacy and normalized fields)
router.post('/', async (req, res) => {
    const { name, email, password, college_id, branch_id, cgpa, location } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email, and password are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO students (name, email, password, college_id, branch_id, cgpa, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, password, college_id ?? null, branch_id ?? null, cgpa ?? null, location ?? null]
        );
        res.status(201).json({ message: 'Student created', student_id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A student with this email already exists' });
        }
        console.error('POST /students error:', err);
        res.status(500).json({ error: 'Failed to create student', details: err.message });
    }
});

// PATCH /students/:id  – update student profile
router.patch('/:id', async (req, res) => {
    const { 
        name, college_id, branch_id, cgpa, location, about_me, 
        skills, github_link, linkedin_link, portfolio_link, 
        resume_url, profile_picture 
    } = req.body;
    
    try {
        const [result] = await db.query(
            `UPDATE students SET 
                name = COALESCE(?, name),
                college_id = COALESCE(?, college_id),
                branch_id = COALESCE(?, branch_id),
                cgpa = COALESCE(?, cgpa),
                location = COALESCE(?, location),
                about_me = COALESCE(?, about_me),
                skills = COALESCE(?, skills),
                github_link = COALESCE(?, github_link),
                linkedin_link = COALESCE(?, linkedin_link),
                portfolio_link = COALESCE(?, portfolio_link),
                resume_url = COALESCE(?, resume_url),
                profile_picture = COALESCE(?, profile_picture)
            WHERE student_id = ?`,
            [name, college_id, branch_id, cgpa, location, about_me, skills, github_link, linkedin_link, portfolio_link, resume_url, profile_picture, req.params.id]
        );
        
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('PATCH /students/:id error:', err);
        res.status(500).json({ error: 'Failed to update profile', details: err.message });
    }
});

// GET /students/:id/eligibility/:min_cgpa - demonstrate DBMS function fn_is_eligible (Week 6)
router.get('/:id/eligibility/:min_cgpa', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT fn_is_eligible(?, ?) AS is_eligible',
            [req.params.id, req.params.min_cgpa]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /students/:id/eligibility error:', err);
        res.status(500).json({ error: 'Failed to check eligibility', details: err.message });
    }
});

// GET /students/:id/history - demonstrate DBMS procedure sp_get_student_history with CURSOR (Week 6)
router.get('/:id/history', async (req, res) => {
    try {
        const [results] = await db.query('CALL sp_get_student_history(?)', [req.params.id]);
        // MySQL returns procedure results as an array of arrays
        res.json(results[0]);
    } catch (err) {
        console.error('GET /students/:id/history error:', err);
        res.status(500).json({ error: 'Failed to fetch student history', details: err.message });
    }
});

module.exports = router;
