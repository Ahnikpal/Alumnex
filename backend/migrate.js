const db = require('./db');

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // Add columns if they don't exist
        const columns = [
            { name: 'about_me', type: 'TEXT DEFAULT NULL' },
            { name: 'skills', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'github_link', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'linkedin_link', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'portfolio_link', type: 'VARCHAR(150) DEFAULT NULL' },
            { name: 'resume_url', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'profile_picture', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'identity_url', type: 'VARCHAR(255) DEFAULT NULL' }
        ];

        for (const col of columns) {
            console.log(`Checking column: ${col.name}`);
            try {
                await db.query(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Column ${col.name} added.`);
            } catch (err) {
                if (err.code === 'ER_DUP_COLUMN_NAME' || err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                    console.log(`ℹ️ Column ${col.name} already exists.`);
                } else {
                    throw err;
                }
            }
        }

        console.log('Checking referrals table...');
        try {
            await db.query(`ALTER TABLE referrals ADD COLUMN resume_url VARCHAR(255) DEFAULT NULL`);
            console.log(`✅ Column resume_url added to referrals.`);
        } catch (err) {
            if (err.code === 'ER_DUP_COLUMN_NAME' || err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                console.log(`ℹ️ Column resume_url already exists in referrals.`);
            } else {
                throw err;
            }
        }

        console.log('Checking alumni table...');
        const alumniCols = [
            { name: 'linkedin', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'bio', type: 'TEXT DEFAULT NULL' },
            { name: 'skills', type: 'TEXT DEFAULT NULL' },
            { name: 'profile_picture', type: 'VARCHAR(255) DEFAULT NULL' }
        ];
        for (const col of alumniCols) {
            try {
                await db.query(`ALTER TABLE alumni ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Alumni column ${col.name} added.`);
            } catch (err) {
                if (err.errno !== 1060) throw err;
            }
        }

        console.log('Checking internships table...');
        const internshipCols = [
            { name: 'logo_url', type: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'description', type: 'TEXT DEFAULT NULL' },
            { name: 'status', type: "ENUM('Active', 'Draft', 'Closed') DEFAULT 'Active'" },
            { name: 'deadline', type: 'DATE DEFAULT NULL' }
        ];
        for (const col of internshipCols) {
            try {
                await db.query(`ALTER TABLE internships ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Internship column ${col.name} added.`);
            } catch (err) {
                if (err.errno !== 1060) throw err;
            }
        }

        console.log('Checking notifications table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                notification_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id         INT NOT NULL,
                user_type       ENUM('student', 'alumni') NOT NULL,
                title           VARCHAR(255) NOT NULL,
                message         TEXT DEFAULT NULL,
                related_id      INT DEFAULT NULL,
                related_type    VARCHAR(50) DEFAULT NULL,
                is_read         BOOLEAN DEFAULT FALSE,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // Ensure new columns exist for existing tables
        const notifCols = [
            { name: 'related_id', type: 'INT DEFAULT NULL' },
            { name: 'related_type', type: 'VARCHAR(50) DEFAULT NULL' }
        ];
        
        for (const col of notifCols) {
            try {
                await db.query(`ALTER TABLE notifications ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Column ${col.name} added to notifications.`);
            } catch (err) {
                if (err.errno !== 1060) throw err;
            }
        }
        console.log(`✅ Notifications table ensured.`);

        console.log('Ensuring internship analytics view...');
        await db.query(`
            CREATE OR REPLACE VIEW v_internship_analytics AS
            SELECT 
                i.internship_id,
                i.company,
                i.role,
                i.location,
                i.duration,
                i.stipend,
                i.posted_at,
                i.posted_by AS posted_by_id,
                i.logo_url,
                i.description,
                i.status,
                i.deadline,
                a.name AS posted_by_name,
                a.company AS posted_by_company,
                COUNT(ap.application_id) AS application_count
            FROM internships i
            LEFT JOIN alumni a ON i.posted_by = a.alumni_id
            LEFT JOIN applications ap ON i.internship_id = ap.internship_id
            GROUP BY i.internship_id, a.alumni_id
        `);
        console.log(`✅ Internship analytics view ensured.`);

        console.log('🚀 Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
