-- Create a dedicated MySQL user for the SMAT application.
-- Update the password below before running this script.

CREATE DATABASE IF NOT EXISTS smat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'smatuser123'@'localhost' IDENTIFIED BY 'Smat!pass';
GRANT ALL PRIVILEGES ON smat_db.* TO 'smatuser123'@'localhost';
FLUSH PRIVILEGES;
