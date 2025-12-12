-- ================================================
-- Test Data Script for Appointment System
-- ================================================
-- This script creates:
-- - 5 Super Admins
-- - 15 Companies
-- - 15 Branch Managers (one per company)
-- ================================================

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM branch_managers;
-- DELETE FROM super_admins;
-- DELETE FROM companies;
-- DELETE FROM users;

-- ================================================
-- INSERT SUPER ADMINS
-- ================================================
-- Password for all users: "password123" (hashed with BCrypt)
-- Hash: $2a$10$rqXVQVxVVxVVxVVxVVxVVeO8kGnXJJJJJJJJJJJJJJJJJJJJJJJJJ

INSERT INTO users (user_type, name, email, phone_number, password, created_at, updated_at) VALUES
('SUPER_ADMIN', 'Admin John Doe', 'admin1@appointment.com', '+90 555 111 1111', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('SUPER_ADMIN', 'Admin Jane Smith', 'admin2@appointment.com', '+90 555 222 2222', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('SUPER_ADMIN', 'Admin Michael Brown', 'admin3@appointment.com', '+90 555 333 3333', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('SUPER_ADMIN', 'Admin Sarah Wilson', 'admin4@appointment.com', '+90 555 444 4444', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('SUPER_ADMIN', 'Admin David Martinez', 'admin5@appointment.com', '+90 555 555 5555', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW());

INSERT INTO super_admins (user_id) 
SELECT user_id FROM users WHERE user_type = 'SUPER_ADMIN';

-- ================================================
-- INSERT COMPANIES
-- ================================================

INSERT INTO companies (name, email, address, phone_number, created_at, updated_at) VALUES
('Derin Bakış Psikoloji', 'info@derinbakis.com', 'Bağdat Cad. No:123 Kadıköy, İstanbul', '+90 216 555 1001', NOW(), NOW()),
('Estetik Palette', 'contact@estetikpalette.com', 'Nispetiye Cad. No:45 Etiler, İstanbul', '+90 212 555 1002', NOW(), NOW()),
('Kronos Klinik', 'info@kronosklinik.com', 'Atatürk Bulvarı No:78 Çankaya, Ankara', '+90 312 555 1003', NOW(), NOW()),
('Fit Limit Stüdyo', 'hello@fitlimit.com', 'Kordonboyu No:234 Alsancak, İzmir', '+90 232 555 1004', NOW(), NOW()),
('Lastik Durağı Pro', 'destek@lastikduragi.com', 'Organize Sanayi Bölgesi No:56 Bursa', '+90 224 555 1005', NOW(), NOW()),
('Teknoloji Plus Servis', 'info@teknolojiplus.com', 'Teknokent Kampüsü No:12 Ankara', '+90 312 555 1006', NOW(), NOW()),
('Güzellik Merkezi Lotus', 'iletisim@lotusguzellik.com', 'Cumhuriyet Cad. No:89 Konak, İzmir', '+90 232 555 1007', NOW(), NOW()),
('Diş Kliniği Dental Plus', 'randevu@dentalplus.com', 'Kızılay Meydanı No:45 Ankara', '+90 312 555 1008', NOW(), NOW()),
('Veteriner Kliniği Pati', 'info@patiklinik.com', 'Bostanlı Mah. No:67 Karşıyaka, İzmir', '+90 232 555 1009', NOW(), NOW()),
('Berber Salonu Kings', 'info@kingsbarber.com', 'Kadıköy İskele Meydanı No:23 İstanbul', '+90 216 555 1010', NOW(), NOW()),
('Yoga & Pilates Studio Zen', 'hello@zenstudio.com', 'Bebek Cad. No:34 Beşiktaş, İstanbul', '+90 212 555 1011', NOW(), NOW()),
('Oto Tamir Servisi AutoFix', 'servis@autofix.com', 'Sanayi Sitesi No:145 Kocaeli', '+90 262 555 1012', NOW(), NOW()),
('Muhasebe Ofisi FinPlus', 'info@finplus.com', 'İş Merkezi Kat:5 No:12 Ankara', '+90 312 555 1013', NOW(), NOW()),
('Hukuk Bürosu Adalet', 'info@adalethukuk.com', 'Adliye Sarayı Karşısı No:78 İstanbul', '+90 212 555 1014', NOW(), NOW()),
('Eğitim Merkezi AkıllıÖğren', 'kayit@akilliögren.com', 'Üniversite Cad. No:90 İzmir', '+90 232 555 1015', NOW(), NOW());

-- ================================================
-- INSERT BRANCH MANAGERS (One per company)
-- ================================================

INSERT INTO users (user_type, name, email, phone_number, password, created_at, updated_at) VALUES
('BRANCH_MANAGER', 'Tayyib Şener', 'tayyib.sener@derinbakis.com', '+90 555 201 0001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Buğra Kaşıkçı', 'bugra.kasikci@estetikpalette.com', '+90 555 201 0002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Ahmet Tuna', 'ahmet.tuna@kronosklinik.com', '+90 555 201 0003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Mahmut Terdemir', 'mahmut.terdemir@fitlimit.com', '+90 555 201 0004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Özan Uçar', 'ozan.ucar@lastikduragi.com', '+90 555 201 0005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Can Yılmaz', 'can.yilmaz@teknolojiplus.com', '+90 555 201 0006', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Elif Demir', 'elif.demir@lotusguzellik.com', '+90 555 201 0007', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Mehmet Kaya', 'mehmet.kaya@dentalplus.com', '+90 555 201 0008', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Zeynep Aydın', 'zeynep.aydin@patiklinik.com', '+90 555 201 0009', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Ali Çelik', 'ali.celik@kingsbarber.com', '+90 555 201 0010', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Ayşe Öztürk', 'ayse.ozturk@zenstudio.com', '+90 555 201 0011', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Mustafa Arslan', 'mustafa.arslan@autofix.com', '+90 555 201 0012', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Fatma Koç', 'fatma.koc@finplus.com', '+90 555 201 0013', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Hasan Yıldız', 'hasan.yildiz@adalethukuk.com', '+90 555 201 0014', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW()),
('BRANCH_MANAGER', 'Selin Aktaş', 'selin.aktas@akilliögren.com', '+90 555 201 0015', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW());

-- Insert into branch_managers table with company assignments
INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'tayyib.sener@derinbakis.com'
  AND c.name = 'Derin Bakış Psikoloji';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'bugra.kasikci@estetikpalette.com'
  AND c.name = 'Estetik Palette';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'ahmet.tuna@kronosklinik.com'
  AND c.name = 'Kronos Klinik';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'mahmut.terdemir@fitlimit.com'
  AND c.name = 'Fit Limit Stüdyo';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'ozan.ucar@lastikduragi.com'
  AND c.name = 'Lastik Durağı Pro';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'can.yilmaz@teknolojiplus.com'
  AND c.name = 'Teknoloji Plus Servis';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'elif.demir@lotusguzellik.com'
  AND c.name = 'Güzellik Merkezi Lotus';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'mehmet.kaya@dentalplus.com'
  AND c.name = 'Diş Kliniği Dental Plus';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'zeynep.aydin@patiklinik.com'
  AND c.name = 'Veteriner Kliniği Pati';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'ali.celik@kingsbarber.com'
  AND c.name = 'Berber Salonu Kings';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'ayse.ozturk@zenstudio.com'
  AND c.name = 'Yoga & Pilates Studio Zen';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'mustafa.arslan@autofix.com'
  AND c.name = 'Oto Tamir Servisi AutoFix';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'fatma.koc@finplus.com'
  AND c.name = 'Muhasebe Ofisi FinPlus';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'hasan.yildiz@adalethukuk.com'
  AND c.name = 'Hukuk Bürosu Adalet';

INSERT INTO branch_managers (user_id, company_id)
SELECT u.user_id, c.company_id
FROM users u
CROSS JOIN companies c
WHERE u.user_type = 'BRANCH_MANAGER'
  AND u.email = 'selin.aktas@akilliögren.com'
  AND c.name = 'Eğitim Merkezi AkıllıÖğren';

-- ================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ================================================
-- SELECT COUNT(*) as super_admin_count FROM super_admins;
-- SELECT COUNT(*) as company_count FROM companies;
-- SELECT COUNT(*) as branch_manager_count FROM branch_managers;
-- 
-- SELECT 
--     c.name as company_name,
--     u.name as manager_name,
--     u.email as manager_email
-- FROM companies c
-- LEFT JOIN branch_managers bm ON c.company_id = bm.company_id
-- LEFT JOIN users u ON bm.user_id = u.user_id
-- ORDER BY c.name;
