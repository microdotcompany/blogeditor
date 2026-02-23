#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
DOMAIN="yourdomain.com"        # change this
REPO_URL="git@github.com:youruser/blogeditor.git"  # change this
APP_DIR="/var/www/blogeditor"
NODE_VERSION="22"

# ─── System updates ──────────────────────────────────────────────────────────
echo ">>> Updating system packages..."
apt update && apt upgrade -y
apt install -y curl git build-essential

# ─── Node.js ──────────────────────────────────────────────────────────────────
echo ">>> Installing Node.js ${NODE_VERSION}.x..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# ─── PM2 ──────────────────────────────────────────────────────────────────────
echo ">>> Installing PM2..."
npm install -g pm2

# ─── Nginx ────────────────────────────────────────────────────────────────────
echo ">>> Installing Nginx..."
apt install -y nginx

cat > /etc/nginx/sites-available/blogeditor <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/blogeditor /etc/nginx/sites-enabled/blogeditor
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ─── App setup ────────────────────────────────────────────────────────────────
echo ">>> Cloning repo..."
git clone "${REPO_URL}" "${APP_DIR}"
cd "${APP_DIR}"

echo ">>> Installing dependencies..."
npm install

# ─── .env ─────────────────────────────────────────────────────────────────────
cat > .env <<'EOF'
PORT=3000
NODE_ENV=production
CLIENT_URL=https://YOURDOMAIN.COM
SERVER_URL=https://YOURDOMAIN.COM
MONGODB_URI=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JWT_SECRET=
FAL_KEY=
EOF

echo ""
echo "================================================"
echo "  Setup complete. Next steps:"
echo "  1. Edit ${APP_DIR}/.env with your credentials"
echo "  2. Then run:"
echo "     cd ${APP_DIR}"
echo "     npm run build"
echo "     pm2 start ecosystem.config.cjs"
echo "     pm2 save"
echo "     pm2 startup"
echo "================================================"
