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
# Step 1: Build project
# -----------------------------
echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ Build completed"

# -----------------------------
# Step 2: Sync files to server
# -----------------------------
echo "⬆️ Syncing files via rsync..."

# Ensure rsync exists
if ! command -v rsync &> /dev/null; then
  echo "❌ rsync is not installed"
  exit 1
fi

# Sync only necessary files (IMPORTANT FIX)
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'build' \
  --exclude '*.dylib' \
  --exclude '.git' \
  --exclude '.env' \
  -e "ssh -o StrictHostKeyChecking=no" \
  ./dist/ $SERVER_USER@$SERVER_IP:$REMOTE_DIR

# Sync package.json (needed for server install)
rsync -avz \
  -e "ssh -o StrictHostKeyChecking=no" \
  ./package.json $SERVER_USER@$SERVER_IP:$REMOTE_DIR

# Optional: sync package-lock.json if exists
if [ -f package-lock.json ]; then
  rsync -avz \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./package-lock.json $SERVER_USER@$SERVER_IP:$REMOTE_DIR
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

ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF

  echo "📂 Navigating to app directory..."
  mkdir -p $REMOTE_DIR
  cd $REMOTE_DIR

  echo "📥 Installing production dependencies..."
  npm ci --only=production

  echo "🔄 Restarting PM2..."
  pm2 restart $APP_NAME || pm2 start index.js --name $APP_NAME

  pm2 save

  echo "✅ Server deployment completed"

EOF

echo "🎉 Deployment successful!"