# Q++RS Platform - Independent Deployment Guide

## Overview
This guide explains how to deploy the Q++RS Universal Platform to your own independent infrastructure, removing dependency on Manus development servers.

## Prerequisites

### Required Services
1. **Server/Hosting** (choose one):
   - AWS EC2 (recommended for scalability)
   - DigitalOcean Droplet
   - Google Cloud Compute Engine
   - Any VPS with Node.js support

2. **Database**:
   - MySQL 8.0+ or TiDB (recommended)
   - Minimum 2GB RAM, 20GB storage

3. **Domain Name**:
   - Your own domain (e.g., qpprs-network.com)
   - SSL certificate (Let's Encrypt free option)

### Minimum Server Specifications
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Network**: Public IP address

## Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt install -y mysql-server

# Secure MySQL
sudo mysql_secure_installation
```

### 2. Database Configuration

```bash
# Create database
sudo mysql -u root -p

CREATE DATABASE helium_network;
CREATE USER 'qpprs_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON helium_network.* TO 'qpprs_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment

```bash
# Clone/upload your project
cd /var/www
sudo mkdir qpprs-platform
sudo chown $USER:$USER qpprs-platform
cd qpprs-platform

# Upload all project files here
# (use scp, rsync, or git)

# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env
nano .env
```

### 4. Environment Configuration

Edit `.env` file with your settings:

```env
# Database
DATABASE_URL=mysql://qpprs_user:your_secure_password@localhost:3306/helium_network

# Application
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Q++RS Universal Platform
VITE_APP_LOGO=https://your-domain.com/logo.png

# iPhone XR Authentication
ALLOWED_DEVICE_MODEL=iPhone11,8
ALLOWED_PHONE_NUMBER=6614782079
OWNER_NAME=Your Name
OWNER_OPEN_ID=auto_generated_on_first_login

# JWT Secret (generate secure random string)
JWT_SECRET=your_very_long_random_secret_key_here

# Remove Manus OAuth (use device auth instead)
# OAUTH_SERVER_URL=  # Leave empty
# VITE_OAUTH_PORTAL_URL=  # Leave empty
```

### 5. Database Migration

```bash
# Push schema to database
pnpm db:push

# Verify tables created
mysql -u qpprs_user -p helium_network -e "SHOW TABLES;"
```

### 6. Build Application

```bash
# Build frontend and backend
pnpm build

# Test production build
NODE_ENV=production node server/_core/index.js
```

### 7. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/_core/index.js --name qpprs-platform

# Configure auto-start
pm2 startup
pm2 save

# Monitor
pm2 status
pm2 logs qpprs-platform
```

### 8. Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Configure site
sudo nano /etc/nginx/sites-available/qpprs-platform
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/qpprs-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 10. Firewall Configuration

```bash
# Configure UFW
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

## iPhone XR-Only Authentication

The platform is configured to accept ONLY your iPhone XR:

### Device Verification
- **Model**: iPhone11,8 (iPhone XR)
- **Phone Number**: 661-478-2079
- **Authentication**: Automatic device fingerprint + phone binding

### How It Works
1. You access the platform from your iPhone XR
2. System detects device model and fingerprint
3. Verifies phone number (661-478-2079)
4. Grants automatic access (no password needed)
5. All other devices see FreshMart decoy site

### Security Features
- 20 Creative Cognition Security Crawlers monitoring 24/7
- Clone detection system blocks emulators
- Production halt on security challenges
- Device fingerprint verification
- Phone number binding

## Maintenance

### Daily Tasks
```bash
# Check application status
pm2 status

# View logs
pm2 logs qpprs-platform --lines 100

# Monitor resources
htop
```

### Weekly Tasks
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Restart application
pm2 restart qpprs-platform

# Check disk space
df -h
```

### Monthly Tasks
```bash
# Database backup
mysqldump -u qpprs_user -p helium_network > backup_$(date +%Y%m%d).sql

# Review security logs
sudo tail -n 1000 /var/log/nginx/access.log
```

## Backup Strategy

### Automated Daily Backups
```bash
# Create backup script
sudo nano /usr/local/bin/qpprs-backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/qpprs"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u qpprs_user -p'your_password' helium_network > $BACKUP_DIR/db_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/qpprs-platform

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/qpprs-backup.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/qpprs-backup.sh
```

## Monitoring

### Application Monitoring
```bash
# Install monitoring tools
pm2 install pm2-logrotate

# Set up alerts
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 30
```

### Server Monitoring
- Use Netdata, Grafana, or similar
- Monitor CPU, RAM, disk, network
- Set up alerts for high resource usage

## Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs qpprs-platform --err

# Verify database connection
mysql -u qpprs_user -p helium_network

# Check port availability
sudo netstat -tulpn | grep 3000
```

### Database Issues
```bash
# Restart MySQL
sudo systemctl restart mysql

# Check MySQL status
sudo systemctl status mysql

# Review MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### High CPU/Memory Usage
```bash
# Check processes
htop

# Restart application
pm2 restart qpprs-platform

# Clear cache
pm2 flush
```

## Security Hardening

### Additional Security Measures
1. **Fail2Ban**: Protect against brute force
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

2. **Automatic Updates**:
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

3. **SSH Key Authentication**:
```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

## Cost Estimates

### Monthly Hosting Costs
- **Basic VPS**: $10-20/month (DigitalOcean, Linode)
- **AWS EC2 t3.medium**: ~$30/month
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$15-35/month

## Support

### Getting Help
- Review application logs: `pm2 logs`
- Check system logs: `/var/log/syslog`
- Database logs: `/var/log/mysql/error.log`
- Nginx logs: `/var/log/nginx/error.log`

## Next Steps

1. ✅ Choose hosting provider
2. ✅ Purchase domain name
3. ✅ Set up server
4. ✅ Deploy application
5. ✅ Configure SSL
6. ✅ Test iPhone XR access
7. ✅ Set up backups
8. ✅ Configure monitoring

---

**Your platform will be fully independent and accessible only from your iPhone XR (661-478-2079) with no passwords required!**
