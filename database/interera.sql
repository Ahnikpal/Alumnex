-- Create and select the database
CREATE DATABASE IF NOT EXISTS alumnex;
USE alumnex;

-- ============================================================
-- Table: colleges (Normalization Layer)
-- ============================================================
CREATE TABLE IF NOT EXISTS colleges (
    college_id   INT          NOT NULL AUTO_INCREMENT,
    name         VARCHAR(200) NOT NULL UNIQUE,
    location     VARCHAR(100) DEFAULT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (college_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: branches (Normalization Layer)
-- ============================================================
CREATE TABLE IF NOT EXISTS branches (
    branch_id    INT          NOT NULL AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    department   VARCHAR(100) DEFAULT NULL,
    PRIMARY KEY (branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: students (Updated for 4NF)
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    student_id    INT          NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    college_id    INT          DEFAULT NULL,
    branch_id     INT          DEFAULT NULL,
    cgpa          DECIMAL(4,2) DEFAULT NULL,
    location      VARCHAR(100) DEFAULT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id),
    CONSTRAINT fk_student_college
        FOREIGN KEY (college_id) REFERENCES colleges (college_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_student_branch
        FOREIGN KEY (branch_id) REFERENCES branches (branch_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: alumni
-- ============================================================
CREATE TABLE IF NOT EXISTS alumni (
    alumni_id        INT          NOT NULL AUTO_INCREMENT,
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    company          VARCHAR(150) NOT NULL,
    role             VARCHAR(100) NOT NULL,
    graduation_year  YEAR         DEFAULT NULL,
    location         VARCHAR(100) DEFAULT NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (alumni_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: internships
-- ============================================================
CREATE TABLE IF NOT EXISTS internships (
    internship_id  INT          NOT NULL AUTO_INCREMENT,
    company        VARCHAR(150) NOT NULL,
    role           VARCHAR(150) NOT NULL,
    location       VARCHAR(100) DEFAULT NULL,
    duration       VARCHAR(50)  DEFAULT NULL,
    stipend        VARCHAR(50)  DEFAULT NULL,
    posted_by      INT          DEFAULT NULL,
    logo_url       VARCHAR(255) DEFAULT NULL,
    description    TEXT         DEFAULT NULL,
    status         ENUM('Active', 'Draft', 'Closed') DEFAULT 'Active',
    deadline       DATE         DEFAULT NULL,
    posted_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (internship_id),
    CONSTRAINT fk_internship_alumni
        FOREIGN KEY (posted_by) REFERENCES alumni (alumni_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
    application_id  INT         NOT NULL AUTO_INCREMENT,
    student_id      INT         NOT NULL,
    internship_id   INT         NOT NULL,
    status          ENUM('pending','under_review','shortlisted','rejected','accepted')
                                NOT NULL DEFAULT 'pending',
    applied_date    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (application_id),
    CONSTRAINT fk_application_student
        FOREIGN KEY (student_id) REFERENCES students (student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_application_internship
        FOREIGN KEY (internship_id) REFERENCES internships (internship_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: referrals
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
    referral_id    INT          NOT NULL AUTO_INCREMENT,
    student_id     INT          NOT NULL,
    alumni_id      INT          NOT NULL,
    internship_id  INT          NOT NULL,
    message        TEXT         DEFAULT NULL,
    status         ENUM('pending','accepted','rejected')
                                NOT NULL DEFAULT 'pending',
    request_date   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (referral_id),
    resume_url     VARCHAR(255) DEFAULT NULL,
    CONSTRAINT fk_referral_student
        FOREIGN KEY (student_id) REFERENCES students (student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_referral_alumni
        FOREIGN KEY (alumni_id) REFERENCES alumni (alumni_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_referral_internship
        FOREIGN KEY (internship_id) REFERENCES internships (internship_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: notifications
-- ============================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Sample seed data 
-- ============================================================

-- Seed Normalization Tables
INSERT INTO colleges (name, location) VALUES 
('SRM University', 'Chennai'),
('VIT Vellore', 'Vellore'),
('IIT Madras', 'Chennai');

INSERT INTO branches (name, department) VALUES 
('CSE', 'Computer Science'),
('IT', 'Information Technology'),
('ECE', 'Electronics');

-- Update Student seed data with normalized IDs
INSERT INTO students (name, email, password, college_id, branch_id, cgpa, location) VALUES
('Amit Kumar',   'amit@example.com',   'hashed_password_4', 1, 1, 8.5, 'Chennai'),
('Sneha Reddy',  'sneha@example.com',  'hashed_password_5', 1, 2, 7.9, 'Chennai'),
('Dev Patel',    'dev@example.com',    'hashed_password_6', 1, 3, 8.2, 'Chennai');

INSERT INTO internships (company, role, location, duration, stipend, posted_by) VALUES
('Google',    'Software Engineer Intern', 'Bangalore', '6 months', '85000',  1),
('Flipkart',  'Backend SDE Intern',       'Bangalore', '4 months', '55000',  2),
('CRED',      'Backend SDE Intern',       'Bangalore', '3 months', '65000',  3);

INSERT INTO applications (student_id, internship_id, status) VALUES
(1, 1, 'pending'),
(2, 2, 'under_review'),
(3, 3, 'shortlisted');

INSERT INTO referrals (student_id, alumni_id, internship_id, message, status) VALUES
(1, 1, 1, 'Looking for a referral at Google for the SWE intern role.', 'pending'),
(2, 2, 2, 'Interested in the Flipkart backend intern role.', 'accepted');

-- ============================================================
-- ADVANCED DBMS CONCEPTS (FOR REVIEW 2)
-- ============================================================

-- 1. VIEW: Internship Analytics
-- Simplifies complex joins and aggregations (Week 5)
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
    COUNT(ap.application_id) AS application_count,
    AVG(s.cgpa) AS avg_applicant_cgpa
FROM internships i
LEFT JOIN alumni a ON i.posted_by = a.alumni_id
LEFT JOIN applications ap ON i.internship_id = ap.internship_id
LEFT JOIN students s ON ap.student_id = s.student_id
GROUP BY i.internship_id, a.alumni_id;

-- 2. FUNCTION: Check Eligibility
-- Logic to determine if a student can apply based on CGPA (Week 6)
DELIMITER //
CREATE FUNCTION fn_is_eligible(p_student_id INT, p_min_cgpa DECIMAL(4,2)) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_cgpa DECIMAL(4,2);
    SELECT cgpa INTO v_cgpa FROM students WHERE student_id = p_student_id;
    IF v_cgpa >= p_min_cgpa THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END //
DELIMITER ;

-- 3. PROCEDURE: Get Student Application History
-- Demonstrates CURSOR, PL/SQL logic, and Exception Handling (Week 6)
DELIMITER //
CREATE PROCEDURE sp_get_student_history(IN p_student_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_role VARCHAR(150);
    DECLARE v_company VARCHAR(150);
    DECLARE v_status VARCHAR(50);
    
    -- CURSOR declaration
    DECLARE cur_apps CURSOR FOR 
        SELECT i.role, i.company, a.status 
        FROM applications a
        JOIN internships i ON a.internship_id = i.internship_id
        WHERE a.student_id = p_student_id;
        
    -- Exception Handling
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT 'Error occurred while fetching history' AS error_message;
    END;

    OPEN cur_apps;
    
    read_loop: LOOP
        FETCH cur_apps INTO v_role, v_company, v_status;
        IF done THEN
            LEAVE read_loop;
        END IF;
        -- Just returning raw data for demonstration
        SELECT v_role, v_company, v_status;
    END LOOP;

    CLOSE cur_apps;
END //
DELIMITER ;

-- 4. TRIGGER: Audit Application Status Change
-- Automates actions on data modification (Week 6)
-- (Create an audit table first)
CREATE TABLE IF NOT EXISTS application_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER //
CREATE TRIGGER trg_after_application_update
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO application_logs (application_id, old_status, new_status)
        VALUES (OLD.application_id, OLD.status, NEW.status);
    END IF;
END //
DELIMITER ;

-- ============================================================
-- DEMONSTRATIVE QUERIES 
-- ============================================================

SELECT branch, COUNT(*) as high_perf_count
FROM students
WHERE cgpa > 8.0
GROUP BY branch
HAVING COUNT(*) >= 1;

-- B. SET OPERATIONS (UNION)
-- Combined list of all users in the system
SELECT name, email, 'Student' as user_type FROM students
UNION
SELECT name, email, 'Alumni' as user_type FROM alumni;


SELECT name, email 
FROM students 
WHERE student_id IN (
    SELECT student_id 
    FROM applications 
    WHERE internship_id IN (
        SELECT internship_id FROM internships WHERE company = 'Google'
    )
);
