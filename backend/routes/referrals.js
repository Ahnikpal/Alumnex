const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/referral_resumes';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'referral-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only PDF files are allowed for resumes'));
    }
});

// GET /referrals  – return all referrals with full join details
router.get('/', async (req, res) => {
    const { alumni_id } = req.query;
    let query = `
        SELECT
            r.referral_id,
            r.message,
            r.status,
            r.request_date,
            s.student_id,
            s.name        AS student_name,
            s.email       AS student_email,
            c.name        AS college,
            s.cgpa        AS student_cgpa,
            b.name        AS student_dept,
            al.alumni_id,
            al.name       AS alumni_name,
            al.company    AS alumni_company,
            al.role       AS alumni_role,
            i.internship_id,
            i.company     AS internship_company,
            i.role        AS internship_role
        FROM referrals r
        JOIN students    s  ON r.student_id   = s.student_id
        LEFT JOIN colleges c ON s.college_id  = c.college_id
        LEFT JOIN branches b ON s.branch_id   = b.branch_id
        JOIN alumni      al ON r.alumni_id    = al.alumni_id
        JOIN internships i  ON r.internship_id = i.internship_id
    `;
    const params = [];

    if (alumni_id) {
        query += ' WHERE r.alumni_id = ?';
        params.push(alumni_id);
    }

    query += ' ORDER BY r.request_date DESC';

    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('GET /referrals error:', err);
        res.status(500).json({ error: 'Failed to fetch referrals', details: err.message });
    }
});

// GET /referrals/:id  – return a single referral
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                r.*,
                s.name   AS student_name,
                al.name  AS alumni_name,
                i.company, i.role
            FROM referrals r
            JOIN students    s  ON r.student_id    = s.student_id
            JOIN alumni      al ON r.alumni_id     = al.alumni_id
            JOIN internships i  ON r.internship_id = i.internship_id
            WHERE r.referral_id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Referral not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /referrals/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch referral', details: err.message });
    }
});

// POST /referrals  – create a new referral request (handles multipart/form-data)
router.post('/', upload.single('resume'), async (req, res) => {
    const { student_id, alumni_id, internship_id, message, status } = req.body;

    if (!student_id || !alumni_id || !internship_id) {
        return res.status(400).json({ error: 'student_id, alumni_id, and internship_id are required' });
    }

    const validStatuses = ['pending', 'accepted', 'rejected'];
    const refStatus = validStatuses.includes(status) ? status : 'pending';
    const resumeUrl = req.file ? `/uploads/referral_resumes/${req.file.filename}` : null;

    // Implementation of CONCURRENCY CONTROL and RECOVERY
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Concurrency Control: Exclusive Row-Level Locking
        const [alumni] = await conn.query('SELECT name, company FROM alumni WHERE alumni_id = ? FOR UPDATE', [alumni_id]);
        if (alumni.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Alumni not found' });
        }

        // 2. Race Condition Check: Prevent multiple active referral requests for the same role
        const [existing] = await conn.query(
            'SELECT referral_id FROM referrals WHERE student_id = ? AND internship_id = ? AND status = "pending"',
            [student_id, internship_id]
        );
        if (existing.length > 0) {
            await conn.rollback();
            return res.status(409).json({ error: 'You already have a pending referral request for this internship' });
        }

        // 3. Atomic Operation: Insert Referral
        const [result] = await conn.query(
            'INSERT INTO referrals (student_id, alumni_id, internship_id, message, status, resume_url) VALUES (?, ?, ?, ?, ?, ?)',
            [student_id, alumni_id, internship_id, message ?? null, refStatus, resumeUrl]
        );

        // 4. Create Notification for alumni
        const [student] = await conn.query('SELECT name FROM students WHERE student_id = ?', [student_id]);
        const studentName = student.length > 0 ? student[0].name : 'A student';
        const notifTitle = "New Referral Request";
        const notifMessage = `${studentName} requested a referral at ${alumni[0].company}`;
        const referralId = result.insertId;

        await conn.query(
            'INSERT INTO notifications (user_id, user_type, title, message, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
            [alumni_id, 'alumni', notifTitle, notifMessage, referralId, 'referral']
        );

        await conn.commit();
        res.status(201).json({ 
            message: 'Referral request created successfully', 
            referral_id: result.insertId,
            resume_url: resumeUrl
        });
    } catch (err) {
        await conn.rollback();
        console.error('POST /referrals transaction error:', err);
        res.status(500).json({ error: 'Failed to create referral request', details: err.message });
    } finally {
        conn.release();
    }
});

// PATCH /referrals/:id/status  – alumni accepts or rejects a referral
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const [result] = await db.query(
            'UPDATE referrals SET status = ? WHERE referral_id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Referral not found' });
        res.json({ message: 'Referral status updated', status });
    } catch (err) {
        console.error('PATCH /referrals/:id/status error:', err);
        res.status(500).json({ error: 'Failed to update referral', details: err.message });
    }
});

module.exports = router;
