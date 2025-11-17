# Deployment Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (production)
- ✅ Groq API key
- ✅ Gmail account for emails
- ✅ Domain name (optional)
- ✅ SSL certificate (for HTTPS)

---

## Deployment Options

### Option 1: Railway (Recommended)

**Pros**:
- Easy deployment
- Free tier available
- Automatic HTTPS
- GitHub integration

**Steps**:
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

**Cost**: $5-10/month

---

### Option 2: Heroku

**Pros**:
- Popular platform
- Easy to use
- Add-ons available

**Steps**:
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create bitsa-backend`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
5. Deploy: `git push heroku main`

**Cost**: $7/month (Eco Dynos)

---

### Option 3: Digital Ocean

**Pros**:
- Full control
- Predictable pricing
- Good performance

**Steps**:
1. Create droplet (Ubuntu 22.04)
2. SSH into server
3. Install Node.js and PostgreSQL
4. Clone repository
5. Setup PM2 for process management
6. Configure Nginx as reverse proxy

**Cost**: $6-12/month

---

### Option 4: AWS (Advanced)

**Services needed**:
- EC2 (compute)
- RDS (database)
- S3 (file storage)
- CloudFront (CDN)

**Cost**: $20-50/month

---

## Environment Setup

### 1. Create Production `.env`

```env
# Database (Use production PostgreSQL)
DATABASE_URL='postgresql://user:password@host:5432/database?sslmode=require'

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL='https://your-frontend-domain.com'

# JWT (Use strong secret!)
JWT_SECRET=your-super-strong-random-secret-key-min-32-chars

# Email Configuration
EMAIL_SENDER=your-production-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=BITSA
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# Email Verification
EMAIL_VERIFICATION_REQUIRED=true
VERIFICATION_TOKEN_EXPIRY=24h

# Groq AI
GROQ_API_KEY=gsk_your_production_api_key
```

### 2. Generate Strong JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Option 1: Neon (Recommended)

**Free Tier**: Yes (0.5GB storage)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL` in `.env`

**Features**:
- Serverless PostgreSQL
- Automatic backups
- Branching (like Git)
- Free SSL

---

### Option 2: Supabase

**Free Tier**: Yes (500MB storage)

1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Add to `.env`

---

### Option 3: Railway PostgreSQL

1. Add PostgreSQL plugin in Railway
2. Copy `DATABASE_URL` from variables
3. Use in your app

---

## Deployment Steps

### Railway Deployment (Detailed)

#### 1. Prepare Repository

```bash
# Ensure package.json has correct scripts
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "migrate": "tsx Src/drizzle/migrate.ts",
    "seed": "tsx Src/drizzle/seed.ts"
  }
}
```

#### 2. Create Railway Project

```bash
# Install Railway CLI (optional)
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

#### 3. Add Database

1. In Railway dashboard, click "New"
2. Select "Database" > "PostgreSQL"
3. Copy `DATABASE_URL` from Variables tab

#### 4. Configure Environment Variables

In Railway dashboard, add all variables from `.env`:

```
DATABASE_URL=<from Railway PostgreSQL>
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
JWT_SECRET=<generated secret>
EMAIL_SENDER=<your email>
EMAIL_PASSWORD=<app password>
GROQ_API_KEY=<your key>
...
```

#### 5. Deploy

```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Deploy to Railway"
git push origin main

# Or deploy via CLI
railway up
```

#### 6. Run Migrations

```bash
# Via Railway CLI
railway run pnpm run migrate
railway run pnpm run seed

# Or create deploy task in Railway dashboard
```

#### 7. Get Deployment URL

Railway provides URL like: `https://bitsa-backend-production.up.railway.app`

---

### Digital Ocean Deployment (Detailed)

#### 1. Create Droplet

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y
```

#### 2. Install Dependencies

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install PostgreSQL
apt install -y postgresql postgresql-contrib
```

#### 3. Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE bitsa_db;
CREATE USER bitsa_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE bitsa_db TO bitsa_user;
\q
```

#### 4. Clone and Setup Project

```bash
# Create app directory
mkdir -p /var/www/bitsa-backend
cd /var/www/bitsa-backend

# Clone repository
git clone https://github.com/yourusername/Bitsa-Website-Backend.git .

# Install dependencies
pnpm install

# Create .env file
nano .env
# (paste production environment variables)

# Build project
pnpm run build

# Run migrations
pnpm run migrate
pnpm run seed
```

#### 5. Setup PM2

```bash
# Start application
pm2 start dist/server.js --name bitsa-backend

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup systemd
```

#### 6. Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/bitsa-backend
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
# Link configuration
ln -s /etc/nginx/sites-available/bitsa-backend /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

#### 7. Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

#### 8. Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Test API
curl https://your-api-url.com/api/health

# Test Swagger docs
open https://your-api-url.com/api-docs
```

### 2. Test Authentication

```bash
# Login
curl -X POST https://your-api-url.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "admin@bitsa.com", "password": "admin123"}'
```

### 3. Test AI Features

```bash
# Chat
curl -X POST https://your-api-url.com/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"message": "Hello"}'
```

### 4. Update Frontend

Update frontend API URL to point to production:

```javascript
// In frontend .env
VITE_API_URL=https://your-api-url.com/api
```

---

## Monitoring

### 1. Setup Logging

**Option A: PM2 Logs (Digital Ocean)**

```bash
# View logs
pm2 logs bitsa-backend

# Save logs to file
pm2 install pm2-logrotate
```

**Option B: Railway Logs**

View logs in Railway dashboard under "Deployments" tab.

---

### 2. Setup Uptime Monitoring

**UptimeRobot** (Free):
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor for your API URL
3. Get alerts via email/SMS

---

### 3. Performance Monitoring

**Option A: New Relic** (Free tier)
**Option B: DataDog** (Free tier)
**Option C: PM2 Plus** (Digital Ocean)

```bash
pm2 link <secret> <public>
```

---

## Backup Strategy

### 1. Database Backups

**Automated (Neon/Railway)**:
- Automatic daily backups
- Point-in-time recovery

**Manual (Digital Ocean)**:

```bash
# Create backup script
nano /root/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump bitsa_db > /root/backups/bitsa_db_$DATE.sql
# Upload to S3 or similar
```

```bash
# Make executable
chmod +x /root/backup-db.sh

# Add to cron (daily at 2 AM)
crontab -e
0 2 * * * /root/backup-db.sh
```

### 2. Code Backups

- Use Git (GitHub/GitLab)
- Tag releases: `git tag v1.0.0`
- Keep multiple branches

---

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check logs
pm2 logs bitsa-backend

# Check port availability
netstat -tulpn | grep :3000

# Restart application
pm2 restart bitsa-backend
```

#### 2. Database Connection Error

```bash
# Test connection
psql $DATABASE_URL

# Check firewall
ufw status

# Verify DATABASE_URL format
echo $DATABASE_URL
```

#### 3. AI Features Not Working

```bash
# Verify API key
echo $GROQ_API_KEY

# Test Groq API
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"
```

#### 4. Email Not Sending

```bash
# Verify Gmail app password
# Check SMTP settings
# Test with Mailtrap.io (development)
```

#### 5. High Memory Usage

```bash
# Check memory
free -h

# Restart PM2
pm2 restart all

# Increase swap (if needed)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

---

## Scaling

### Horizontal Scaling

**Railway/Heroku**:
- Increase number of dynos/replicas
- Add load balancer

**Digital Ocean**:
- Use multiple droplets
- Setup Nginx load balancer
- Use managed database

### Vertical Scaling

- Increase server resources (CPU/RAM)
- Optimize database queries
- Add Redis for caching

---

## Security Checklist

- ✅ Use HTTPS (SSL certificate)
- ✅ Strong JWT secret (32+ characters)
- ✅ Environment variables (never commit `.env`)
- ✅ Enable firewall
- ✅ Regular security updates
- ✅ Database backup strategy
- ✅ Rate limiting (add if needed)
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (using ORM)

---

## CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm run build
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Cost Estimation

### Minimal Setup (Hobby Project)
- **Neon DB**: Free
- **Railway**: $5/month
- **Groq AI**: Free (14,400 req/day)
- **Total**: ~$5/month

### Small Production
- **Railway**: $10/month
- **Neon DB**: Free or $10/month
- **Domain**: $12/year
- **Groq AI**: Free
- **Total**: ~$20-25/month

### Medium Production
- **Digital Ocean Droplet**: $12/month
- **Managed Database**: $15/month
- **Domain + SSL**: $12/year
- **Monitoring**: Free tier
- **Total**: ~$30-35/month

---

## Support

For deployment issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Digital Ocean: [docs.digitalocean.com](https://docs.digitalocean.com)
- Heroku: [devcenter.heroku.com](https://devcenter.heroku.com)

---

**Good luck with your deployment! 🚀**
