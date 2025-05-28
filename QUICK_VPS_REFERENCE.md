# 🚀 Quick VPS Deployment Reference Card

> **Fast deployment checklist for Podplay Build Sanctuary**

## 🔐 SSH Connection
```bash
# Your SSH details
Username: woody
Private Key: ~/.ssh/id_ed25519_vps
Public Key: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF1dH3EeYSbPoa1LRWnWYYuAfxKxMpOlLI4LzLs7CLDE woody@dartopia-vps-20250528

# Connect to VPS
ssh -i ~/.ssh/id_ed25519_vps woody@YOUR_VPS_IP
```

## ⚡ 5-Minute VPS Setup
```bash
# 1. Connect as root and setup user
adduser podplay
usermod -aG sudo,docker podplay
mkdir -p /home/podplay/.ssh
cp ~/.ssh/authorized_keys /home/podplay/.ssh/
chown -R podplay:podplay /home/podplay/.ssh

# 2. Install Docker
curl -fsSL https://get.docker.com | sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Install Nginx + SSL
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx -y

# 4. Deploy app
sudo mkdir -p /opt/podplay-sanctuary
sudo chown podplay:podplay /opt/podplay-sanctuary
cd /opt/podplay-sanctuary
git clone https://github.com/daddyholmes/Podplay-Sanctuary.git .
cp .env.production.template .env.production
# EDIT .env.production with your API keys and domain!
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Domain & SSL Setup
```bash
# Configure Nginx (replace yourdomain.com)
sudo nano /etc/nginx/sites-available/podplay-sanctuary
sudo ln -s /etc/nginx/sites-available/podplay-sanctuary /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## 📋 Required Environment Variables
```env
# CRITICAL: Add these to .env.production
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
TOGETHER_API_KEY=your-together-api-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
SECRET_KEY=your-32-character-secret-key
```

## 🔍 Quick Health Checks
```bash
# Check containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check nginx
sudo systemctl status nginx

# Test endpoints
curl https://yourdomain.com/health
```

## 🆘 Emergency Commands
```bash
# Restart everything
docker-compose -f docker-compose.prod.yml restart

# Full rebuild
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check disk space
df -h

# Check memory
free -h
```

---
**Need help?** Check `VPS_INSTALLATION_GUIDE.md` for complete details!
