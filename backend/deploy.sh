#!/bin/bash

echo "🚀 Starting deployment..."

# -----------------------------
# Load environment variables
# -----------------------------
if [ -f .env ]; then
  export $(grep -v '^#' .env | sed 's/#.*//' | xargs)
else
  echo "❌ .env file not found"
  exit 1
fi

# Validate required vars
if [ -z "$SERVER_IP" ] || [ -z "$SERVER_USER" ] || [ -z "$REMOTE_DIR" ] || [ -z "$APP_NAME" ]; then
  echo "❌ Missing required env variables"
  echo "Required: SERVER_IP, SERVER_USER, REMOTE_DIR, APP_NAME"
  exit 1
fi

# -----------------------------
# Step 1: Sync files to server
# -----------------------------
echo "⬆️ Syncing files via rsync..."

# Ensure rsync exists
if ! command -v rsync &> /dev/null; then
  echo "❌ rsync is not installed"
  exit 1
fi

SSH_PREFIX=""
RSYNC_RSH="ssh -o StrictHostKeyChecking=no"
if [ -n "$SERVER_PASSWORD" ] && command -v sshpass &> /dev/null; then
  SSH_PREFIX="sshpass -p $SERVER_PASSWORD"
  RSYNC_RSH="sshpass -p $SERVER_PASSWORD ssh -o StrictHostKeyChecking=no"
fi

echo "📁 Creating remote directories..."
$SSH_PREFIX ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR/src $REMOTE_DIR/scripts"

# Sync only necessary files
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  -e "$RSYNC_RSH" \
  ./src/ $SERVER_USER@$SERVER_IP:$REMOTE_DIR/src

rsync -avz --delete \
  -e "$RSYNC_RSH" \
  ./scripts/ $SERVER_USER@$SERVER_IP:$REMOTE_DIR/scripts

# Sync .env
rsync -avz \
  -e "$RSYNC_RSH" \
  ./.env $SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env

# Sync package.json (needed for server install)
rsync -avz \
  -e "$RSYNC_RSH" \
  ./package.json $SERVER_USER@$SERVER_IP:$REMOTE_DIR/package.json

# Optional: sync package-lock.json if exists
if [ -f package-lock.json ]; then
  rsync -avz \
    -e "$RSYNC_RSH" \
    ./package-lock.json $SERVER_USER@$SERVER_IP:$REMOTE_DIR/package-lock.json
fi

if [ $? -ne 0 ]; then
  echo "❌ File sync failed"
  exit 1
fi

echo "✅ Files synced"

# -----------------------------
# Step 3: Run commands on server
# -----------------------------
echo "🔧 Finalizing on server..."

$SSH_PREFIX ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
  set -e
  REMOTE_DIR="/var/www/authentiks"
  APP_NAME="authentiks"

  echo "📦 Installing system dependencies (unzip for Puppeteer)..."
  apt-get update && apt-get install -y unzip

  echo "🧹 Cleaning broken puppeteer cache if any..."
  rm -rf /root/.cache/puppeteer

  echo "📂 Navigating to app directory..."
  cd $REMOTE_DIR

  echo "📥 Installing production dependencies..."
  npm install --omit=dev

  echo "🌐 Configuring Nginx for api.authentiks.in..."
  cat << 'NGINX_CONF' > /etc/nginx/sites-available/api.authentiks.in
server {
    listen 80;
    server_name api.authentiks.in;

    location / {
        proxy_pass http://127.0.0.1:5000;
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
NGINX_CONF

  ln -sf /etc/nginx/sites-available/api.authentiks.in /etc/nginx/sites-enabled/api.authentiks.in
  nginx -t && systemctl reload nginx

  echo "🔒 Setting up SSL with certbot if available..."
  if command -v certbot &> /dev/null; then
    certbot --nginx -d api.authentiks.in --non-interactive --agree-tos -m support@authentiks.in --redirect || true
  fi

  echo "🔄 Starting/Restarting PM2 for $APP_NAME..."
  pm2 delete $APP_NAME 2>/dev/null || true
  pm2 start src/server.js --name $APP_NAME
  pm2 save

  echo "📋 Checking status..."
  pm2 status $APP_NAME

  echo "✅ Server deployment completed"
EOF

echo "🎉 Deployment successful!"