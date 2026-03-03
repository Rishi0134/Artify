#!/usr/bin/env bash
set -euo pipefail

# Full MERN hosting script for Ubuntu EC2
# - Frontend: Vite build served by Nginx
# - Backend: Node/Express on port 5000 via PM2
# - Reverse proxy: /api and /uploads -> backend
#
# Usage:
#   bash host_artify.sh --domain madhvi.artify --app-dir /home/ubuntu/Artify-Virtual_Art_Gallery
#   bash host_artify.sh --domain _ --app-dir /home/ubuntu/Artify-Virtual_Art_Gallery

DOMAIN="_"
APP_DIR="/home/ubuntu/Artify-Virtual_Art_Gallery"
BACKEND_PORT="5000"
BACKEND_PM2_NAME="artify-backend"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain)
      DOMAIN="${2:-_}"
      shift 2
      ;;
    --app-dir)
      APP_DIR="${2:-$APP_DIR}"
      shift 2
      ;;
    --backend-port)
      BACKEND_PORT="${2:-$BACKEND_PORT}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

FRONTEND_DIR="$APP_DIR/frontend"
BACKEND_DIR="$APP_DIR/backend"
NGINX_SITE="/etc/nginx/sites-available/artify"
NGINX_LINK="/etc/nginx/sites-enabled/artify"

echo "==> Checking project directories"
[[ -d "$FRONTEND_DIR" ]] || { echo "Missing frontend dir: $FRONTEND_DIR"; exit 1; }
[[ -d "$BACKEND_DIR" ]] || { echo "Missing backend dir: $BACKEND_DIR"; exit 1; }

echo "==> Installing system packages"
sudo apt-get update -y
sudo apt-get install -y nginx curl git ca-certificates gnupg

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2"
  sudo npm install -g pm2
fi

echo "==> Installing backend dependencies"
cd "$BACKEND_DIR"
npm ci --omit=dev || npm install

if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  echo "Missing backend .env at $BACKEND_DIR/.env"
  echo "Create it first with at least: PORT=$BACKEND_PORT, MONGO_URI, JWT_SECRET"
  exit 1
fi

echo "==> Starting backend with PM2"
pm2 delete "$BACKEND_PM2_NAME" >/dev/null 2>&1 || true
pm2 start src/server.js --name "$BACKEND_PM2_NAME"
pm2 save
pm2 startup systemd -u "$USER" --hp "$HOME" >/tmp/pm2-startup-artify.txt 2>&1 || true

echo "==> Installing frontend dependencies + building"
cd "$FRONTEND_DIR"
npm ci || npm install
npm run build

echo "==> Writing Nginx site config"
sudo tee "$NGINX_SITE" >/dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${FRONTEND_DIR}/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri /index.html;
    }
}
EOF

echo "==> Enabling Nginx site"
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sfn "$NGINX_SITE" "$NGINX_LINK"
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "==> Health checks"
echo "Backend:"
curl -sS "http://127.0.0.1:${BACKEND_PORT}/api/health" || true
echo
echo "Nginx API route:"
curl -sS "http://127.0.0.1/api/health" || true
echo

echo "==> Done"
echo "Frontend root: ${FRONTEND_DIR}/dist"
echo "Backend PM2 app: ${BACKEND_PM2_NAME}"
echo "Domain/server_name: ${DOMAIN}"
echo
echo "If domain DNS is configured, open: http://${DOMAIN}"
echo "Otherwise open your EC2 public IP in browser."
