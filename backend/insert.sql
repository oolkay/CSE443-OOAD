INSERT INTO companies (company_id, address,created_at, email, name, phone_number, updated_at) VALUES
(1,	'address',	NOW(),	'some@company.com', 'Berber', 124, NOW()),
(2,	'address1',	NOW(),	'some@company1.com', 'Güzellik merkezi', 4221, NOW()),
(3,	'address2',	NOW(),	'some@company2.com', 'psikolog', 4224, NOW()),
(4,	'address3',	NOW(),	'some@company3.com', 'Dişçi', 4253, NOW());


INSERT INTO services (service_id, created_at, description, name, price, time_duration, updated_at, company_id) VALUES
(1, NOW(), 'desc', 'Sakal Traş', 10.00, 15, NOW(), 1),
(2, NOW(), 'desc', 'Saç Traş', 40.00, 30, NOW(), 1),
(3, NOW(), 'desc', 'Saç Sakal Traş', 40.00, 30, NOW(), 1),
(4, NOW(), 'desc', 'Lazer', 10.00, 60, NOW(), 2),
(5, NOW(), 'desc', 'Törpü', 45.00, 45, NOW(), 2),
(6, NOW(), 'desc', 'Yüz Bakım', 45.00, 15, NOW(), 2),
(7, NOW(), 'desc', 'Çift Terapisi', 10.00, 15, NOW(), 3),
(8, NOW(), 'desc', 'İmplant', 30.00, 30, NOW(), 4),
(9, NOW(), 'desc', 'Kanal', 10.00, 30, NOW(), 4);


-- Insert resources (equipment/facilities for each company)
INSERT INTO resources (resource_id, company_id, name, description, status, created_at, updated_at) VALUES
-- Berber (Company 1) resources
(1, 1, 'Berber Koltuğu 1', 'Elektrikli berber koltuğu', 'AVAILABLE', NOW(), NOW()),
(2, 1, 'Berber Koltuğu 2', 'Elektrikli berber koltuğu', 'AVAILABLE', NOW(), NOW()),
(3, 1, 'Berber Koltuğu 3', 'Manuel berber koltuğu', 'AVAILABLE', NOW(), NOW()),
(4, 1, 'Traş Makinesi Pro', 'Profesyonel traş makinesi', 'AVAILABLE', NOW(), NOW()),

-- Güzellik Merkezi (Company 2) resources
(5, 2, 'Lazer Cihazı 1', 'Diod lazer epilasyon cihazı', 'AVAILABLE', NOW(), NOW()),
(6, 2, 'Lazer Cihazı 2', 'Alexandrite lazer cihazı', 'AVAILABLE', NOW(), NOW()),
(7, 2, 'Manikür Masası 1', 'LED aydınlatmalı manikür masası', 'AVAILABLE', NOW(), NOW()),
(8, 2, 'Manikür Masası 2', 'LED aydınlatmalı manikür masası', 'AVAILABLE', NOW(), NOW()),
(9, 2, 'Cilt Bakım Cihazı', 'Ultrasonik cilt bakım cihazı', 'AVAILABLE', NOW(), NOW()),

-- Psikolog (Company 3) resources
(10, 3, 'Terapi Odası 1', 'Rahat koltuklu terapi odası', 'AVAILABLE', NOW(), NOW()),
(11, 3, 'Terapi Odası 2', 'Sessiz terapi odası', 'AVAILABLE', NOW(), NOW()),
(12, 3, 'Grup Terapi Odası', 'Büyük grup seansları için oda', 'AVAILABLE', NOW(), NOW()),

-- Dişçi (Company 4) resources
(13, 4, 'Diş Ünitesi 1', 'Modern diş tedavi ünitesi', 'AVAILABLE', NOW(), NOW()),
(14, 4, 'Diş Ünitesi 2', 'Modern diş tedavi ünitesi', 'AVAILABLE', NOW(), NOW()),
(15, 4, 'Diş Ünitesi 3', 'Modern diş tedavi ünitesi', 'AVAILABLE', NOW(), NOW()),
(16, 4, 'Röntgen Cihazı', 'Dijital panoramik röntgen', 'AVAILABLE', NOW(), NOW()),
(17, 4, 'Sterilizasyon Ünitesi', 'Otoklav sterilizasyon cihazı', 'AVAILABLE', NOW(), NOW());


-- Link services with their required resources (service_resources join table)
INSERT INTO service_resources (service_id, resource_id) VALUES
-- Berber services with chair resources
(1, 1), -- Sakal Traş -> Berber Koltuğu 1
(1, 2), -- Sakal Traş -> Berber Koltuğu 2
(1, 3), -- Sakal Traş -> Berber Koltuğu 3
(2, 1), -- Saç Traş -> Berber Koltuğu 1
(2, 2), -- Saç Traş -> Berber Koltuğu 2
(2, 3), -- Saç Traş -> Berber Koltuğu 3
(3, 1), -- Saç Sakal Traş -> Berber Koltuğu 1
(3, 2), -- Saç Sakal Traş -> Berber Koltuğu 2

-- Beauty center services with equipment
(4, 5), -- Lazer -> Lazer Cihazı 1
(4, 6), -- Lazer -> Lazer Cihazı 2
(5, 7), -- Törpü -> Manikür Masası 1
(5, 8), -- Törpü -> Manikür Masası 2
(6, 9), -- Yüz Bakım -> Cilt Bakım Cihazı

-- Psychologist services with therapy rooms
(7, 10), -- Çift Terapisi -> Terapi Odası 1
(7, 11), -- Çift Terapisi -> Terapi Odası 2
(7, 12), -- Çift Terapisi -> Grup Terapi Odası

-- Dentist services with dental equipment
(8, 13), -- İmplant -> Diş Ünitesi 1
(8, 14), -- İmplant -> Diş Ünitesi 2
(8, 15), -- İmplant -> Diş Ünitesi 3
(9, 13), -- Kanal -> Diş Ünitesi 1
(9, 14), -- Kanal -> Diş Ünitesi 2
(9, 15); -- Kanal -> Diş Ünitesi 3


INSERT INTO users (
    user_type, user_id, created_at, email, name, password, phone_number, updated_at
) VALUES
('SUPER_ADMIN', 1, NOW(), 'user1@example.com', 'User One', 'pass1', '555-0001', NOW()),
('BRANCH_MANAGER', 2, NOW(), 'user2@example.com', 'User Two', 'pass2', NULL, NOW()),
('BRANCH_MANAGER', 3, NOW(), 'user3@example.com', 'User Three', 'pass3', '555-0003', NOW()),
('BRANCH_MANAGER', 4, NOW(), 'user4@example.com', 'User Four', 'pass4', '555-0004', NOW()),
('BRANCH_MANAGER', 5, NOW(), 'user5@example.com', 'User Five', 'pass5', NULL, NOW()),
('EMPLOYEE', 6, NOW(), 'user6@example.com', 'User Six', 'pass6', '555-0006', NOW()),
('EMPLOYEE', 7, NOW(), 'user7@example.com', 'User Seven', 'pass7', '555-0007', NOW()),
('EMPLOYEE', 8, NOW(), 'user8@example.com', 'User Eight', 'pass8', NULL, NOW()),
('EMPLOYEE', 9, NOW(), 'user9@example.com', 'User Nine', 'pass9', '555-0009', NOW()),
('EMPLOYEE', 10, NOW(), 'user10@example.com', 'User Ten', 'pass10', '555-0010', NOW()),
('EMPLOYEE', 11, NOW(), 'user11@example.com', 'User Eleven', 'pass11', '555-0011', NOW()),
('EMPLOYEE', 12, NOW(), 'user12@example.com', 'User Twelve', 'pass12', NULL, NOW()),
('EMPLOYEE', 13, NOW(), 'user13@example.com', 'User Thirteen', 'pass13', '555-0013', NOW()),
('EMPLOYEE', 14, NOW(), 'user14@example.com', 'User Fourteen', 'pass14', '555-0014', NOW()),
('EMPLOYEE', 15, NOW(), 'user15@example.com', 'User Fifteen', 'pass15', NULL, NOW()),
('CUSTOMER', 16, NOW(), 'user16@example.com', 'User Sixteen', 'pass16', '555-0016', NOW()),
('CUSTOMER', 17, NOW(), 'user17@example.com', 'User Seventeen', 'pass17', '555-0017', NOW()),
('CUSTOMER', 18, NOW(), 'user18@example.com', 'User Eighteen', 'pass18', NULL, NOW()),
('CUSTOMER', 19, NOW(), 'user19@example.com', 'User Nineteen', 'pass19', '555-0019', NOW()),
('CUSTOMER', 20, NOW(), 'user20@example.com', 'User Twenty', 'pass20', '555-0020', NOW()),
('CUSTOMER', 21, NOW(), 'user21@example.com', 'User Twenty-One', 'pass21', '555-0021', NOW()),
('CUSTOMER', 22, NOW(), 'user22@example.com', 'User Twenty-Two', 'pass22', NULL, NOW()),
('CUSTOMER', 23, NOW(), 'user23@example.com', 'User Twenty-Three', 'pass23', '555-0023', NOW()),
('CUSTOMER', 24, NOW(), 'user24@example.com', 'User Twenty-Four', 'pass24', '555-0024', NOW()),
('CUSTOMER', 25, NOW(), 'user25@example.com', 'User Twenty-Five', 'pass25', NULL, NOW()),
('CUSTOMER', 26, NOW(), 'user26@example.com', 'User Twenty-Six', 'pass26', '555-0026', NOW()),
('CUSTOMER', 27, NOW(), 'user27@example.com', 'User Twenty-Seven', 'pass27', '555-0027', NOW()),
('CUSTOMER', 28, NOW(), 'user28@example.com', 'User Twenty-Eight', 'pass28', NULL, NOW()),
('CUSTOMER', 29, NOW(), 'user29@example.com', 'User Twenty-Nine', 'pass29', '555-0029', NOW()),
('CUSTOMER', 30, NOW(), 'user30@example.com', 'User Thirty', 'pass30', '555-0030', NOW()),
('CUSTOMER', 31, NOW(), 'user31@example.com', 'User Thirty-One', 'pass31', '555-0031', NOW()),
('CUSTOMER', 32, NOW(), 'user32@example.com', 'User Thirty-Two', 'pass32', NULL, NOW()),
('CUSTOMER', 33, NOW(), 'user33@example.com', 'User Thirty-Three', 'pass33', '555-0033', NOW()),
('CUSTOMER', 34, NOW(), 'user34@example.com', 'User Thirty-Four', 'pass34', '555-0034', NOW()),
('CUSTOMER', 35, NOW(), 'user35@example.com', 'User Thirty-Five', 'pass35', NULL, NOW()),
('CUSTOMER', 36, NOW(), 'user36@example.com', 'User Thirty-Six', 'pass36', '555-0036', NOW()),
('CUSTOMER', 37, NOW(), 'user37@example.com', 'User Thirty-Seven', 'pass37', '555-0037', NOW()),
('CUSTOMER', 38, NOW(), 'user38@example.com', 'User Thirty-Eight', 'pass38', NULL, NOW()),
('CUSTOMER', 39, NOW(), 'user39@example.com', 'User Thirty-Nine', 'pass39', '555-0039', NOW()),
('CUSTOMER', 40, NOW(), 'user40@example.com', 'User Forty', 'pass40', '555-0040', NOW()),
('CUSTOMER', 41, NOW(), 'user41@example.com', 'User Forty-One', 'pass41', '555-0041', NOW()),
('CUSTOMER', 42, NOW(), 'user42@example.com', 'User Forty-Two', 'pass42', NULL, NOW()),
('CUSTOMER', 43, NOW(), 'user43@example.com', 'User Forty-Three', 'pass43', '555-0043', NOW()),
('CUSTOMER', 44, NOW(), 'user44@example.com', 'User Forty-Four', 'pass44', '555-0044', NOW()),
('CUSTOMER', 45, NOW(), 'user45@example.com', 'User Forty-Five', 'pass45', NULL, NOW()),
('CUSTOMER', 46, NOW(), 'user46@example.com', 'User Forty-Six', 'pass46', '555-0046', NOW()),
('CUSTOMER', 47, NOW(), 'user47@example.com', 'User Forty-Seven', 'pass47', '555-0047', NOW()),
('CUSTOMER', 48, NOW(), 'user48@example.com', 'User Forty-Eight', 'pass48', NULL, NOW()),
('CUSTOMER', 49, NOW(), 'user49@example.com', 'User Forty-Nine', 'pass49', '555-0049', NOW()),
('CUSTOMER', 50, NOW(), 'user50@example.com', 'User Fifty', 'pass50', '555-0050', NOW());


INSERT INTO super_admins (user_id) VALUES
(1);


INSERT INTO branch_managers (user_id, company_id) VALUES
(2, 1),
(3, 2),
(4, 3),
(5, 4);


INSERT INTO employees (user_id, company_id, manager_id) VALUES
(6, 1, 2),
(7, 1, 2),
(8, 1, 2),
(9, 2, 3),
(10, 2, 3),
(11, 2, 3),
(12, 3, 4),
(13, 4, 5),
(14, 4, 5),
(15, 4, 5);


INSERT INTO customers (user_id) VALUES
(16), (17), (18), (19), (20), (21), (22), (23), (24), (25), (26), (27), (28), (29), 
(30), (31), (32), (33), (34), (35), (36), (37), (38), (39), (40), (41), (42), (43),
(44), (45), (46), (47), (48), (49), (50);


INSERT INTO appointments (appointment_id, created_at, updated_at, start_time, end_time, status, customer_id, employee_id, service_id) VALUES
(1  , NOW(), NOW(), '2025-12-18 09:00:00.000', '2025-12-18 09:15:00.000', 'APPROVED',  16, 6, 1),
(2  , NOW(), NOW(), '2025-12-18 09:15:00.000', '2025-12-18 10:15:00.000', 'APPROVED',  16, 9, 4),
(3  , NOW(), NOW(), '2025-12-18 10:15:00.000', '2025-12-18 10:30:00.000', 'APPROVED',  16, 12, 7),
(4  , NOW(), NOW(), '2025-12-18 10:30:00.000', '2025-12-18 11:00:00.000', 'APPROVED',  16, 13, 8),
(5  , NOW(), NOW(), '2025-12-18 09:15:00.000', '2025-12-18 09:45:00.000', 'APPROVED',  17, 6, 2),
(6  , NOW(), NOW(), '2025-12-18 10:15:00.000', '2025-12-18 11:15:00.000', 'APPROVED',  17, 9, 4),
(7  , NOW(), NOW(), '2025-12-18 11:15:00.000', '2025-12-18 11:30:00.000', 'APPROVED',  17, 12, 7),
(8  , NOW(), NOW(), '2025-12-18 11:30:00.000', '2025-12-18 12:00:00.000', 'APPROVED',  17, 13, 8),
(9  , NOW(), NOW(), '2025-12-18 09:45:00.000', '2025-12-18 10:15:00.000', 'APPROVED',  18, 6, 3),
(10 , NOW(), NOW(), '2025-12-18 11:15:00.000', '2025-12-18 12:15:00.000', 'APPROVED',  18, 9, 4),
(11 , NOW(), NOW(), '2025-12-18 12:15:00.000', '2025-12-18 12:30:00.000', 'APPROVED',  18, 12, 7),
(12 , NOW(), NOW(), '2025-12-18 12:30:00.000', '2025-12-18 13:00:00.000', 'APPROVED',  18, 13, 8),
(13 , NOW(), NOW(), '2025-12-18 10:15:00.000', '2025-12-18 10:45:00.000', 'APPROVED',  19, 6, 3),
(14 , NOW(), NOW(), '2025-12-18 12:15:00.000', '2025-12-18 13:15:00.000', 'APPROVED',  19, 9, 4),
(15 , NOW(), NOW(), '2025-12-18 13:15:00.000', '2025-12-18 13:30:00.000', 'APPROVED',  19, 12, 7),
(16 , NOW(), NOW(), '2025-12-18 13:30:00.000', '2025-12-18 14:00:00.000', 'APPROVED',  19, 13, 8),
(17 , NOW(), NOW(), '2025-12-18 09:00:00.000', '2025-12-18 09:30:00.000', 'APPROVED',  20, 7, 3),
(18 , NOW(), NOW(), '2025-12-18 13:15:00.000', '2025-12-18 14:00:00.000', 'APPROVED',  20, 9, 5),
(19 , NOW(), NOW(), '2025-12-18 14:00:00.000', '2025-12-18 14:15:00.000', 'APPROVED',  20, 12, 7),
(20 , NOW(), NOW(), '2025-12-18 14:15:00.000', '2025-12-18 14:45:00.000', 'APPROVED',  20, 14, 8),
(21 , NOW(), NOW(), '2025-12-18 09:30:00.000', '2025-12-18 10:00:00.000', 'APPROVED',  21, 7, 2),
(22 , NOW(), NOW(), '2025-12-18 14:00:00.000', '2025-12-18 14:45:00.000', 'APPROVED',  21, 9, 5),
(23 , NOW(), NOW(), '2025-12-18 14:45:00.000', '2025-12-18 15:00:00.000', 'APPROVED',  21, 12, 7),
(24 , NOW(), NOW(), '2025-12-18 15:00:00.000', '2025-12-18 15:30:00.000', 'APPROVED',  21, 14, 8),
(25 , NOW(), NOW(), '2025-12-18 10:00:00.000', '2025-12-18 10:30:00.000', 'APPROVED',  22, 7, 2),
(26 , NOW(), NOW(), '2025-12-18 10:30:00.000', '2025-12-18 11:15:00.000', 'APPROVED',  22, 10, 5),
(27 , NOW(), NOW(), '2025-12-18 15:00:00.000', '2025-12-18 15:15:00.000', 'APPROVED',  22, 12, 7),
(28 , NOW(), NOW(), '2025-12-18 15:30:00.000', '2025-12-18 16:00:00.000', 'APPROVED',  22, 14, 8),
(29 , NOW(), NOW(), '2025-12-18 10:30:00.000', '2025-12-18 11:00:00.000', 'APPROVED',  23, 7, 2),
(30 , NOW(), NOW(), '2025-12-18 11:15:00.000', '2025-12-18 12:00:00.000', 'APPROVED',  23, 10, 5),
(31 , NOW(), NOW(), '2025-12-18 15:15:00.000', '2025-12-18 15:30:00.000', 'APPROVED',  23, 12, 7),
(32 , NOW(), NOW(), '2025-12-18 16:00:00.000', '2025-12-18 16:30:00.000', 'APPROVED',  23, 14, 8),
(33 , NOW(), NOW(), '2025-12-18 09:00:00.000', '2025-12-18 09:30:00.000', 'APPROVED',  24, 8, 3),
(34 , NOW(), NOW(), '2025-12-18 12:00:00.000', '2025-12-18 12:45:00.000', 'APPROVED',  24, 10, 5),
(35 , NOW(), NOW(), '2025-12-18 15:30:00.000', '2025-12-18 15:45:00.000', 'APPROVED',  24, 12, 7),
(36 , NOW(), NOW(), '2025-12-18 15:45:00.000', '2025-12-18 16:15:00.000', 'APPROVED',  24, 15, 8),
(37 , NOW(), NOW(), '2025-12-18 09:30:00.000', '2025-12-18 10:00:00.000', 'APPROVED',  25, 8, 3),
(38 , NOW(), NOW(), '2025-12-18 12:45:00.000', '2025-12-18 13:30:00.000', 'APPROVED',  25, 10, 5),
(39 , NOW(), NOW(), '2025-12-18 15:45:00.000', '2025-12-18 16:00:00.000', 'APPROVED',  25, 12, 7),
(40 , NOW(), NOW(), '2025-12-18 16:15:00.000', '2025-12-18 16:45:00.000', 'APPROVED',  25, 15, 8),
(41 , NOW(), NOW(), '2025-12-18 10:00:00.000', '2025-12-18 10:15:00.000', 'APPROVED',  26, 8, 1),
(42 , NOW(), NOW(), '2025-12-18 13:30:00.000', '2025-12-18 14:15:00.000', 'APPROVED',  26, 10, 5),
(43 , NOW(), NOW(), '2025-12-18 16:00:00.000', '2025-12-18 16:15:00.000', 'APPROVED',  26, 12, 7),
(44 , NOW(), NOW(), '2025-12-18 16:45:00.000', '2025-12-18 17:15:00.000', 'APPROVED',  26, 15, 8),
(45 , NOW(), NOW(), '2025-12-18 10:15:00.000', '2025-12-18 10:45:00.000', 'APPROVED',  27, 8, 2),
(46 , NOW(), NOW(), '2025-12-18 14:15:00.000', '2025-12-18 15:00:00.000', 'APPROVED',  27, 10, 5),
(47 , NOW(), NOW(), '2025-12-18 16:15:00.000', '2025-12-18 16:30:00.000', 'APPROVED',  27, 12, 7),
(48 , NOW(), NOW(), '2025-12-18 17:15:00.000', '2025-12-18 17:45:00.000', 'APPROVED',  27, 15, 8),
(49 , NOW(), NOW(), '2025-12-18 10:45:00.000', '2025-12-18 11:15:00.000', 'APPROVED',  28, 6, 3),
(50 , NOW(), NOW(), '2025-12-18 11:15:00.000', '2025-12-18 11:30:00.000', 'APPROVED',  28, 11, 6),
(51 , NOW(), NOW(), '2025-12-18 16:30:00.000', '2025-12-18 16:45:00.000', 'APPROVED',  28, 12, 7),
(52 , NOW(), NOW(), '2025-12-19 09:00:00.000', '2025-12-19 09:30:00.000', 'APPROVED',  28, 15, 8),
(53 , NOW(), NOW(), '2025-12-18 11:15:00.000', '2025-12-18 11:45:00.000', 'APPROVED',  29, 6, 2),
(54 , NOW(), NOW(), '2025-12-18 11:45:00.000', '2025-12-18 12:00:00.000', 'APPROVED',  29, 11, 6),
(55 , NOW(), NOW(), '2025-12-18 16:45:00.000', '2025-12-18 17:00:00.000', 'APPROVED',  29, 12, 7),
(56 , NOW(), NOW(), '2025-12-19 09:30:00.000', '2025-12-19 10:00:00.000', 'APPROVED',  29, 15, 8),
(57 , NOW(), NOW(), '2025-12-18 11:45:00.000', '2025-12-18 12:15:00.000', 'APPROVED',  30, 6, 3),
(58 , NOW(), NOW(), '2025-12-18 12:15:00.000', '2025-12-18 12:30:00.000', 'APPROVED',  30, 11, 6),
(59 , NOW(), NOW(), '2025-12-18 17:00:00.000', '2025-12-18 17:15:00.000', 'APPROVED',  30, 12, 7),
(60 , NOW(), NOW(), '2025-12-19 10:00:00.000', '2025-12-19 10:30:00.000', 'APPROVED',  30, 15, 8),
(61 , NOW(), NOW(), '2025-12-18 12:15:00.000', '2025-12-18 12:45:00.000', 'APPROVED',  31, 6, 2),
(62 , NOW(), NOW(), '2025-12-18 12:45:00.000', '2025-12-18 13:00:00.000', 'APPROVED',  31, 11, 6),
(63 , NOW(), NOW(), '2025-12-18 17:15:00.000', '2025-12-18 17:30:00.000', 'APPROVED',  31, 12, 7),
(64 , NOW(), NOW(), '2025-12-19 10:30:00.000', '2025-12-19 11:00:00.000', 'APPROVED',  31, 15, 8),
(65 , NOW(), NOW(), '2025-12-18 12:45:00.000', '2025-12-18 13:15:00.000', 'APPROVED',  32, 6, 2),
(66 , NOW(), NOW(), '2025-12-18 13:15:00.000', '2025-12-18 14:15:00.000', 'APPROVED',  32, 11, 4),
(67 , NOW(), NOW(), '2025-12-18 17:30:00.000', '2025-12-18 17:45:00.000', 'APPROVED',  32, 12, 7),
(68 , NOW(), NOW(), '2025-12-19 09:00:00.000', '2025-12-19 09:30:00.000', 'APPROVED',  32, 13, 9),
(69 , NOW(), NOW(), '2025-12-18 13:15:00.000', '2025-12-18 13:45:00.000', 'APPROVED',  33, 6, 2),
(70 , NOW(), NOW(), '2025-12-18 14:15:00.000', '2025-12-18 15:15:00.000', 'APPROVED',  33, 11, 4),
(71 , NOW(), NOW(), '2025-12-18 17:45:00.000', '2025-12-18 18:00:00.000', 'APPROVED',  33, 12, 7),
(72 , NOW(), NOW(), '2025-12-19 09:00:00.000', '2025-12-19 09:30:00.000', 'APPROVED',  33, 13, 9),
(73 , NOW(), NOW(), '2025-12-18 13:45:00.000', '2025-12-18 14:15:00.000', 'APPROVED',  34, 6, 2),
(74 , NOW(), NOW(), '2025-12-18 15:00:00.000', '2025-12-18 16:00:00.000', 'APPROVED',  34, 10, 4),
(75 , NOW(), NOW(), '2025-12-19 09:00:00.000', '2025-12-19 09:15:00.000', 'APPROVED',  34, 12, 7),
(76 , NOW(), NOW(), '2025-12-19 09:30:00.000', '2025-12-19 10:00:00.000', 'APPROVED',  34, 13, 9),
(77 , NOW(), NOW(), '2025-12-18 14:15:00.000', '2025-12-18 14:45:00.000', 'APPROVED',  35, 6, 3),
(78 , NOW(), NOW(), '2025-12-18 14:45:00.000', '2025-12-18 15:45:00.000', 'APPROVED',  35, 9, 4),
(79 , NOW(), NOW(), '2025-12-19 09:15:00.000', '2025-12-19 09:30:00.000', 'APPROVED',  35, 12, 7),
(80 , NOW(), NOW(), '2025-12-19 10:00:00.000', '2025-12-19 10:30:00.000', 'APPROVED',  35, 13, 9),
(81 , NOW(), NOW(), '2025-12-18 11:00:00.000', '2025-12-18 11:30:00.000', 'APPROVED',  36, 7, 3),
(82 , NOW(), NOW(), '2025-12-18 15:45:00.000', '2025-12-18 16:00:00.000', 'APPROVED',  36, 9, 6),
(83 , NOW(), NOW(), '2025-12-19 09:30:00.000', '2025-12-19 09:45:00.000', 'APPROVED',  36, 12, 7),
(84 , NOW(), NOW(), '2025-12-19 10:30:00.000', '2025-12-19 11:00:00.000', 'APPROVED',  36, 13, 9),
(85 , NOW(), NOW(), '2025-12-18 10:45:00.000', '2025-12-18 11:15:00.000', 'APPROVED',  37, 8, 3),
(86 , NOW(), NOW(), '2025-12-18 16:00:00.000', '2025-12-18 16:15:00.000', 'APPROVED',  37, 9, 6),
(87 , NOW(), NOW(), '2025-12-19 09:45:00.000', '2025-12-19 10:00:00.000', 'APPROVED',  37, 12, 7),
(88 , NOW(), NOW(), '2025-12-19 11:00:00.000', '2025-12-19 11:30:00.000', 'APPROVED',  37, 13, 9),
(89 , NOW(), NOW(), '2025-12-18 11:15:00.000', '2025-12-18 11:45:00.000', 'APPROVED',  38, 8, 3),
(90 , NOW(), NOW(), '2025-12-18 16:15:00.000', '2025-12-18 16:30:00.000', 'APPROVED',  38, 9, 6),
(91 , NOW(), NOW(), '2025-12-19 10:00:00.000', '2025-12-19 10:15:00.000', 'APPROVED',  38, 12, 7),
(92 , NOW(), NOW(), '2025-12-19 11:30:00.000', '2025-12-19 12:00:00.000', 'APPROVED',  38, 13, 9),
(93 , NOW(), NOW(), '2025-12-18 11:45:00.000', '2025-12-18 12:15:00.000', 'APPROVED',  39, 8, 2),
(94 , NOW(), NOW(), '2025-12-18 16:30:00.000', '2025-12-18 16:45:00.000', 'APPROVED',  39, 9, 6),
(95 , NOW(), NOW(), '2025-12-19 10:15:00.000', '2025-12-19 10:30:00.000', 'APPROVED',  39, 12, 7),
(96 , NOW(), NOW(), '2025-12-19 12:00:00.000', '2025-12-19 12:30:00.000', 'APPROVED',  39, 13, 9),
(97 , NOW(), NOW(), '2025-12-18 12:15:00.000', '2025-12-18 12:45:00.000', 'APPROVED',  40, 8, 2),
(98 , NOW(), NOW(), '2025-12-18 16:45:00.000', '2025-12-18 17:45:00.000', 'APPROVED',  40, 9, 4),
(99 , NOW(), NOW(), '2025-12-19 10:30:00.000', '2025-12-19 10:45:00.000', 'APPROVED',  40, 12, 7),
(100, NOW(), NOW(), '2025-12-19 10:45:00.000', '2025-12-19 11:15:00.000', 'APPROVED',  40, 14, 9),
(101, NOW(), NOW(), '2025-12-18 14:45:00.000', '2025-12-18 15:15:00.000', 'APPROVED',  41, 6, 2),
(102, NOW(), NOW(), '2025-12-18 16:00:00.000', '2025-12-18 16:45:00.000', 'APPROVED',  41, 10, 5),
(103, NOW(), NOW(), '2025-12-19 10:45:00.000', '2025-12-19 11:00:00.000', 'APPROVED',  41, 12, 7),
(104, NOW(), NOW(), '2025-12-19 11:00:00.000', '2025-12-19 11:30:00.000', 'APPROVED',  41, 15, 9),
(105, NOW(), NOW(), '2025-12-18 15:15:00.000', '2025-12-18 15:45:00.000', 'APPROVED',  42, 6, 2),
(106, NOW(), NOW(), '2025-12-18 16:45:00.000', '2025-12-18 17:30:00.000', 'APPROVED',  42, 10, 5),
(107, NOW(), NOW(), '2025-12-19 11:00:00.000', '2025-12-19 11:15:00.000', 'APPROVED',  42, 12, 7),
(108, NOW(), NOW(), '2025-12-19 11:30:00.000', '2025-12-19 12:00:00.000', 'APPROVED',  42, 15, 8),
(109, NOW(), NOW(), '2025-12-18 15:45:00.000', '2025-12-18 16:15:00.000', 'APPROVED',  43, 6, 3),
(110, NOW(), NOW(), '2025-12-19 09:00:00.000', '2025-12-19 09:45:00.000', 'APPROVED',  43, 10, 5),
(111, NOW(), NOW(), '2025-12-19 11:15:00.000', '2025-12-19 11:30:00.000', 'APPROVED',  43, 12, 7),
(112, NOW(), NOW(), '2025-12-19 12:00:00.000', '2025-12-19 12:30:00.000', 'APPROVED',  43, 15, 8),
(113, NOW(), NOW(), '2025-12-18 16:15:00.000', '2025-12-18 16:45:00.000', 'APPROVED',  44, 6, 3),
(114, NOW(), NOW(), '2025-12-19 09:45:00.000', '2025-12-19 10:30:00.000', 'APPROVED',  44, 10, 5),
(115, NOW(), NOW(), '2025-12-19 11:30:00.000', '2025-12-19 11:45:00.000', 'APPROVED',  44, 12, 7),
(116, NOW(), NOW(), '2025-12-19 12:30:00.000', '2025-12-19 13:00:00.000', 'APPROVED',  44, 15, 8),
(117, NOW(), NOW(), '2025-12-18 11:30:00.000', '2025-12-18 12:00:00.000', 'APPROVED',  45, 7, 3),
(118, NOW(), NOW(), '2025-12-19 10:30:00.000', '2025-12-19 11:30:00.000', 'APPROVED',  45, 10, 4),
(119, NOW(), NOW(), '2025-12-19 11:45:00.000', '2025-12-19 12:00:00.000', 'APPROVED',  45, 12, 7),
(120, NOW(), NOW(), '2025-12-19 13:00:00.000', '2025-12-19 13:30:00.000', 'APPROVED',  45, 15, 8),
(121, NOW(), NOW(), '2025-12-18 12:00:00.000', '2025-12-18 12:30:00.000', 'APPROVED',  46, 7, 3),
(122, NOW(), NOW(), '2025-12-18 15:15:00.000', '2025-12-18 16:15:00.000', 'APPROVED',  46, 11, 4),
(123, NOW(), NOW(), '2025-12-19 12:00:00.000', '2025-12-19 12:15:00.000', 'APPROVED',  46, 12, 7),
(124, NOW(), NOW(), '2025-12-19 13:30:00.000', '2025-12-19 14:00:00.000', 'APPROVED',  46, 15, 8),
(125, NOW(), NOW(), '2025-12-18 12:45:00.000', '2025-12-18 13:15:00.000', 'APPROVED',  47, 8, 3),
(126, NOW(), NOW(), '2025-12-18 16:15:00.000', '2025-12-18 16:30:00.000', 'APPROVED',  47, 11, 6),
(127, NOW(), NOW(), '2025-12-19 12:15:00.000', '2025-12-19 12:30:00.000', 'APPROVED',  47, 12, 7),
(128, NOW(), NOW(), '2025-12-19 14:00:00.000', '2025-12-19 14:30:00.000', 'APPROVED',  47, 15, 8),
(129, NOW(), NOW(), '2025-12-18 13:15:00.000', '2025-12-18 13:45:00.000', 'APPROVED',  48, 8, 3),
(130, NOW(), NOW(), '2025-12-18 16:30:00.000', '2025-12-18 16:45:00.000', 'APPROVED',  48, 11, 6),
(131, NOW(), NOW(), '2025-12-19 12:30:00.000', '2025-12-19 12:45:00.000', 'APPROVED',  48, 12, 7),
(132, NOW(), NOW(), '2025-12-19 14:30:00.000', '2025-12-19 15:00:00.000', 'APPROVED',  48, 15, 8),
(133, NOW(), NOW(), '2025-12-18 13:45:00.000', '2025-12-18 14:00:00.000', 'APPROVED',  49, 8, 1),
(134, NOW(), NOW(), '2025-12-18 16:45:00.000', '2025-12-18 17:00:00.000', 'APPROVED',  49, 11, 6),
(135, NOW(), NOW(), '2025-12-19 12:45:00.000', '2025-12-19 13:00:00.000', 'APPROVED',  49, 12, 7),
(136, NOW(), NOW(), '2025-12-19 15:00:00.000', '2025-12-19 15:30:00.000', 'APPROVED',  49, 15, 8),
(137, NOW(), NOW(), '2025-12-18 14:00:00.000', '2025-12-18 14:15:00.000', 'APPROVED',  50, 8, 1),
(138, NOW(), NOW(), '2025-12-18 17:00:00.000', '2025-12-18 17:15:00.000', 'APPROVED',  50, 11, 6),
(139, NOW(), NOW(), '2025-12-19 13:00:00.000', '2025-12-19 13:15:00.000', 'APPROVED',  50, 12, 7),
(140, NOW(), NOW(), '2025-12-19 15:30:00.000', '2025-12-19 16:00:00.000', 'APPROVED',  50, 15, 8);


INSERT INTO employee_services (service_id, employee_id)
SELECT DISTINCT
    a.service_id,
    a.employee_id
FROM appointments a;


-- Link appointments with the specific resources they used (appointment_resources join table)
-- This shows which exact resource instance was assigned to each appointment
INSERT INTO appointment_resources (appointment_id, resource_id) VALUES
-- Berber appointments using specific chairs
(1, 1),   -- Appointment 1 (Sakal Traş) -> Berber Koltuğu 1
(5, 2),   -- Appointment 5 (Saç Traş) -> Berber Koltuğu 2
(9, 3),   -- Appointment 9 (Saç Sakal Traş) -> Berber Koltuğu 3
(13, 1),  -- Appointment 13 (Saç Sakal Traş) -> Berber Koltuğu 1
(17, 2),  -- Appointment 17 (Saç Sakal Traş) -> Berber Koltuğu 2
(21, 1),  -- Appointment 21 (Saç Traş) -> Berber Koltuğu 1
(25, 2),  -- Appointment 25 (Saç Traş) -> Berber Koltuğu 2
(29, 1),  -- Appointment 29 (Saç Traş) -> Berber Koltuğu 1
(33, 3),  -- Appointment 33 (Saç Sakal Traş) -> Berber Koltuğu 3
(37, 1),  -- Appointment 37 (Saç Sakal Traş) -> Berber Koltuğu 1
(41, 2),  -- Appointment 41 (Sakal Traş) -> Berber Koltuğu 2
(45, 3),  -- Appointment 45 (Saç Traş) -> Berber Koltuğu 3
(49, 1),  -- Appointment 49 (Saç Sakal Traş) -> Berber Koltuğu 1
(53, 2),  -- Appointment 53 (Saç Traş) -> Berber Koltuğu 2
(57, 3),  -- Appointment 57 (Saç Sakal Traş) -> Berber Koltuğu 3
(61, 1),  -- Appointment 61 (Saç Traş) -> Berber Koltuğu 1
(65, 2),  -- Appointment 65 (Saç Traş) -> Berber Koltuğu 2
(69, 3),  -- Appointment 69 (Saç Traş) -> Berber Koltuğu 3
(73, 1),  -- Appointment 73 (Saç Traş) -> Berber Koltuğu 1
(77, 2),  -- Appointment 77 (Saç Sakal Traş) -> Berber Koltuğu 2
(81, 3),  -- Appointment 81 (Saç Sakal Traş) -> Berber Koltuğu 3
(85, 1),  -- Appointment 85 (Saç Sakal Traş) -> Berber Koltuğu 1
(89, 2),  -- Appointment 89 (Saç Sakal Traş) -> Berber Koltuğu 2
(93, 3),  -- Appointment 93 (Saç Traş) -> Berber Koltuğu 3
(97, 1),  -- Appointment 97 (Saç Traş) -> Berber Koltuğu 1
(101, 2), -- Appointment 101 (Saç Traş) -> Berber Koltuğu 2
(105, 3), -- Appointment 105 (Saç Traş) -> Berber Koltuğu 3
(109, 1), -- Appointment 109 (Saç Sakal Traş) -> Berber Koltuğu 1
(113, 2), -- Appointment 113 (Saç Sakal Traş) -> Berber Koltuğu 2
(117, 3), -- Appointment 117 (Saç Sakal Traş) -> Berber Koltuğu 3
(121, 1), -- Appointment 121 (Saç Sakal Traş) -> Berber Koltuğu 1
(125, 2), -- Appointment 125 (Saç Sakal Traş) -> Berber Koltuğu 2
(129, 3), -- Appointment 129 (Saç Sakal Traş) -> Berber Koltuğu 3
(133, 1), -- Appointment 133 (Sakal Traş) -> Berber Koltuğu 1
(137, 2), -- Appointment 137 (Sakal Traş) -> Berber Koltuğu 2

-- Beauty center appointments using specific equipment
(2, 5),   -- Appointment 2 (Lazer) -> Lazer Cihazı 1
(6, 6),   -- Appointment 6 (Lazer) -> Lazer Cihazı 2
(10, 5),  -- Appointment 10 (Lazer) -> Lazer Cihazı 1
(14, 6),  -- Appointment 14 (Lazer) -> Lazer Cihazı 2
(18, 7),  -- Appointment 18 (Törpü) -> Manikür Masası 1
(22, 8),  -- Appointment 22 (Törpü) -> Manikür Masası 2
(26, 7),  -- Appointment 26 (Törpü) -> Manikür Masası 1
(30, 8),  -- Appointment 30 (Törpü) -> Manikür Masası 2
(34, 7),  -- Appointment 34 (Törpü) -> Manikür Masası 1
(38, 8),  -- Appointment 38 (Törpü) -> Manikür Masası 2
(42, 7),  -- Appointment 42 (Törpü) -> Manikür Masası 1
(46, 8),  -- Appointment 46 (Törpü) -> Manikür Masası 2
(50, 9),  -- Appointment 50 (Yüz Bakım) -> Cilt Bakım Cihazı
(54, 9),  -- Appointment 54 (Yüz Bakım) -> Cilt Bakım Cihazı
(58, 9),  -- Appointment 58 (Yüz Bakım) -> Cilt Bakım Cihazı
(62, 9),  -- Appointment 62 (Yüz Bakım) -> Cilt Bakım Cihazı
(66, 5),  -- Appointment 66 (Lazer) -> Lazer Cihazı 1
(70, 6),  -- Appointment 70 (Lazer) -> Lazer Cihazı 2
(74, 5),  -- Appointment 74 (Lazer) -> Lazer Cihazı 1
(78, 6),  -- Appointment 78 (Lazer) -> Lazer Cihazı 2
(82, 9),  -- Appointment 82 (Yüz Bakım) -> Cilt Bakım Cihazı
(86, 9),  -- Appointment 86 (Yüz Bakım) -> Cilt Bakım Cihazı
(90, 9),  -- Appointment 90 (Yüz Bakım) -> Cilt Bakım Cihazı
(94, 9),  -- Appointment 94 (Yüz Bakım) -> Cilt Bakım Cihazı
(98, 5),  -- Appointment 98 (Lazer) -> Lazer Cihazı 1
(102, 7), -- Appointment 102 (Törpü) -> Manikür Masası 1
(106, 8), -- Appointment 106 (Törpü) -> Manikür Masası 2
(110, 7), -- Appointment 110 (Törpü) -> Manikür Masası 1
(114, 8), -- Appointment 114 (Törpü) -> Manikür Masası 2
(118, 6), -- Appointment 118 (Lazer) -> Lazer Cihazı 2
(122, 5), -- Appointment 122 (Lazer) -> Lazer Cihazı 1
(126, 9), -- Appointment 126 (Yüz Bakım) -> Cilt Bakım Cihazı
(130, 9), -- Appointment 130 (Yüz Bakım) -> Cilt Bakım Cihazı
(134, 9), -- Appointment 134 (Yüz Bakım) -> Cilt Bakım Cihazı
(138, 9), -- Appointment 138 (Yüz Bakım) -> Cilt Bakım Cihazı

-- Psychologist appointments using therapy rooms
(3, 10),  -- Appointment 3 (Çift Terapisi) -> Terapi Odası 1
(7, 11),  -- Appointment 7 (Çift Terapisi) -> Terapi Odası 2
(11, 10), -- Appointment 11 (Çift Terapisi) -> Terapi Odası 1
(15, 11), -- Appointment 15 (Çift Terapisi) -> Terapi Odası 2
(19, 10), -- Appointment 19 (Çift Terapisi) -> Terapi Odası 1
(23, 11), -- Appointment 23 (Çift Terapisi) -> Terapi Odası 2
(27, 10), -- Appointment 27 (Çift Terapisi) -> Terapi Odası 1
(31, 11), -- Appointment 31 (Çift Terapisi) -> Terapi Odası 2
(35, 10), -- Appointment 35 (Çift Terapisi) -> Terapi Odası 1
(39, 11), -- Appointment 39 (Çift Terapisi) -> Terapi Odası 2
(43, 10), -- Appointment 43 (Çift Terapisi) -> Terapi Odası 1
(47, 11), -- Appointment 47 (Çift Terapisi) -> Terapi Odası 2
(51, 10), -- Appointment 51 (Çift Terapisi) -> Terapi Odası 1
(55, 11), -- Appointment 55 (Çift Terapisi) -> Terapi Odası 2
(59, 10), -- Appointment 59 (Çift Terapisi) -> Terapi Odası 1
(63, 11), -- Appointment 63 (Çift Terapisi) -> Terapi Odası 2
(67, 10), -- Appointment 67 (Çift Terapisi) -> Terapi Odası 1
(71, 11), -- Appointment 71 (Çift Terapisi) -> Terapi Odası 2
(75, 10), -- Appointment 75 (Çift Terapisi) -> Terapi Odası 1
(79, 11), -- Appointment 79 (Çift Terapisi) -> Terapi Odası 2
(83, 10), -- Appointment 83 (Çift Terapisi) -> Terapi Odası 1
(87, 11), -- Appointment 87 (Çift Terapisi) -> Terapi Odası 2
(91, 10), -- Appointment 91 (Çift Terapisi) -> Terapi Odası 1
(95, 11), -- Appointment 95 (Çift Terapisi) -> Terapi Odası 2
(99, 10), -- Appointment 99 (Çift Terapisi) -> Terapi Odası 1
(103, 11), -- Appointment 103 (Çift Terapisi) -> Terapi Odası 2
(107, 10), -- Appointment 107 (Çift Terapisi) -> Terapi Odası 1
(111, 11), -- Appointment 111 (Çift Terapisi) -> Terapi Odası 2
(115, 10), -- Appointment 115 (Çift Terapisi) -> Terapi Odası 1
(119, 11), -- Appointment 119 (Çift Terapisi) -> Terapi Odası 2
(123, 10), -- Appointment 123 (Çift Terapisi) -> Terapi Odası 1
(127, 11), -- Appointment 127 (Çift Terapisi) -> Terapi Odası 2
(131, 10), -- Appointment 131 (Çift Terapisi) -> Terapi Odası 1
(135, 11), -- Appointment 135 (Çift Terapisi) -> Terapi Odası 2
(139, 10), -- Appointment 139 (Çift Terapisi) -> Terapi Odası 1

-- Dentist appointments using dental equipment
(4, 13),  -- Appointment 4 (İmplant) -> Diş Ünitesi 1
(8, 14),  -- Appointment 8 (İmplant) -> Diş Ünitesi 2
(12, 15), -- Appointment 12 (İmplant) -> Diş Ünitesi 3
(16, 13), -- Appointment 16 (İmplant) -> Diş Ünitesi 1
(20, 14), -- Appointment 20 (İmplant) -> Diş Ünitesi 2
(24, 15), -- Appointment 24 (İmplant) -> Diş Ünitesi 3
(28, 13), -- Appointment 28 (İmplant) -> Diş Ünitesi 1
(32, 14), -- Appointment 32 (İmplant) -> Diş Ünitesi 2
(36, 15), -- Appointment 36 (İmplant) -> Diş Ünitesi 3
(40, 13), -- Appointment 40 (İmplant) -> Diş Ünitesi 1
(44, 14), -- Appointment 44 (İmplant) -> Diş Ünitesi 2
(48, 15), -- Appointment 48 (İmplant) -> Diş Ünitesi 3
(52, 13), -- Appointment 52 (İmplant) -> Diş Ünitesi 1
(56, 14), -- Appointment 56 (İmplant) -> Diş Ünitesi 2
(60, 15), -- Appointment 60 (İmplant) -> Diş Ünitesi 3
(64, 13), -- Appointment 64 (İmplant) -> Diş Ünitesi 1
(68, 14), -- Appointment 68 (Kanal) -> Diş Ünitesi 2
(72, 15), -- Appointment 72 (Kanal) -> Diş Ünitesi 3
(76, 13), -- Appointment 76 (Kanal) -> Diş Ünitesi 1
(80, 14), -- Appointment 80 (Kanal) -> Diş Ünitesi 2
(84, 15), -- Appointment 84 (Kanal) -> Diş Ünitesi 3
(88, 13), -- Appointment 88 (Kanal) -> Diş Ünitesi 1
(92, 14), -- Appointment 92 (Kanal) -> Diş Ünitesi 2
(96, 15), -- Appointment 96 (Kanal) -> Diş Ünitesi 3
(100, 13), -- Appointment 100 (Kanal) -> Diş Ünitesi 1
(104, 14), -- Appointment 104 (Kanal) -> Diş Ünitesi 2
(108, 15), -- Appointment 108 (İmplant) -> Diş Ünitesi 3
(112, 13), -- Appointment 112 (İmplant) -> Diş Ünitesi 1
(116, 14), -- Appointment 116 (İmplant) -> Diş Ünitesi 2
(120, 15), -- Appointment 120 (İmplant) -> Diş Ünitesi 3
(124, 13), -- Appointment 124 (İmplant) -> Diş Ünitesi 1
(128, 14), -- Appointment 128 (İmplant) -> Diş Ünitesi 2
(132, 15), -- Appointment 132 (İmplant) -> Diş Ünitesi 3
(136, 13), -- Appointment 136 (İmplant) -> Diş Ünitesi 1
(140, 14); -- Appointment 140 (İmplant) -> Diş Ünitesi 2


insert into working_shifts (shift_id, employee_id, shift_name, start_time, end_time, day_of_week, created_at, updated_at) values
(1, 6, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(2, 6, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(3, 6, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(4, 6, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(5, 6, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(6, 7, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(7, 7, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(8, 7, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(9, 7, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(10, 7, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(11, 8, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(12, 8, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(13, 8, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(14, 8, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(15, 8, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(16, 9, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(17, 9, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(18, 9, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(19, 9, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(20, 9, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(21, 10, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(22, 10, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(23, 10, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(24, 10, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(25, 10, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(26, 11, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(27, 11, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(28, 11, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(29, 11, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(30, 11, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(31, 12, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(32, 12, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(33, 12, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(34, 12, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(35, 12, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(36, 13, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(37, 13, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(38, 13, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(39, 13, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(40, 13, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(41, 14, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(42, 14, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(43, 14, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(44, 14, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(45, 14, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),
(46, 15, 'Monday', '09:00:00', '18:00:00', 'MONDAY', NOW(), NOW()),
(47, 15, 'Tuesday', '09:00:00', '18:00:00', 'TUESDAY', NOW(), NOW()),
(48, 15, 'Wednesday', '09:00:00', '18:00:00', 'WEDNESDAY', NOW(), NOW()),
(49, 15, 'Thursday', '09:00:00', '18:00:00', 'THURSDAY', NOW(), NOW()),
(50, 15, 'Friday', '09:00:00', '18:00:00', 'FRIDAY', NOW(), NOW()),

