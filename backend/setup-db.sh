#!/bin/bash

# PostgreSQL Database Setup Script for Appointment API
# This script sets up the database and user for the application

echo "🔧 Setting up PostgreSQL database..."

# Check if PostgreSQL is installed
if ! psql -V; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo "   sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

echo ""
echo "📝 Creating database and user..."
echo "   Database: appointmentdb"
echo "   User: appointment_user"
echo ""

# Create database and user
sudo -u postgres psql <<EOF
-- Drop database if exists (uncomment if you want to reset)
-- DROP DATABASE IF EXISTS appointmentdb;
-- DROP USER IF EXISTS appointment_user;

-- Create user
CREATE USER appointment_user WITH PASSWORD 'appointment_password';

-- Create database
CREATE DATABASE appointmentdb WITH OWNER appointment_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE appointmentdb TO appointment_user;

\c appointmentdb

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO appointment_user;

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📊 Database Details:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: appointmentdb"
    echo "   Username: appointment_user"
    echo "   Password: appointment_password"
    echo ""
    echo "🔍 To connect manually:"
    echo "   psql -U appointment_user -d appointmentdb -h localhost"
    echo ""
else
    echo ""
    echo "❌ Database setup failed!"
    exit 1
fi


