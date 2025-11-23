sudo apt update
sudo apt install openjdk-21-jdk openjdk-21-jre -y
sudo apt install maven -y


sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql

# Check if it's running
sudo systemctl status postgresql

# Enable it to start automatically on boot
sudo systemctl enable postgresql



# Switch to postgres user
sudo -u postgres psql

``` Sql
# Then run these SQL commands:
CREATE DATABASE appointmentdb;
CREATE USER appointment_user WITH PASSWORD 'appointment_password';
GRANT ALL PRIVILEGES ON DATABASE appointmentdb TO appointment_user;
\q
```