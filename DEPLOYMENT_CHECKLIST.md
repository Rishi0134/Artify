# Deployment Checklist (EC2 + Nginx)

Use this checklist after every frontend/backend update.

## 1) DNS

- Create an `A` record:
  - Host: `madhvi.artify`
  - Value: your EC2 public IPv4 (example `13.201.34.102`)
- Verify from EC2:

```bash
nslookup madhvi.artify
```

## 2) Nginx Server Block

Use this server block (key point: no trailing `/api/` rewrite mistakes).

```nginx
server {
    listen 80;
    server_name madhvi.artify www.madhvi.artify;

    root /home/ubuntu/Artify-Virtual_Art_Gallery/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

Apply and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 3) Backend Process

Restart backend to ensure admin seeding runs:

```bash
pm2 restart all
pm2 logs --lines 100
```

Look for:
- `Database connected`
- `Admin sync completed`

## 4) Frontend Build and Serve

```bash
cd ~/Artify-Virtual_Art_Gallery/frontend
npm install
npm run build
sudo systemctl reload nginx
```

## 5) Quick Production Tests

Backend direct:

```bash
curl -i http://127.0.0.1:5000/api/health
curl -i -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"madhvitandel@gmail.com","password":"Madhvi@123"}'
```

Domain route:

```bash
curl -i http://madhvi.artify/api/health
curl -i -X POST http://madhvi.artify/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"madhvitandel@gmail.com","password":"Madhvi@123"}'
```

Browser:
- Hard refresh (`Ctrl+Shift+R`) with DevTools > Network > Disable cache.
- Register a new user should redirect to `/login`.
- Login admin should open `/admin/dashboard`.
- Upload an artwork and verify image appears in Gallery.

## 6) Current App Behavior (after latest fixes)

- Register does not auto-login; it always redirects to `/login`.
- API base URL:
  - Dev mode defaults to `http://localhost:5000`
  - Production defaults to same-origin (`/api/...`)
- Password visibility toggle icon is available on Login/Register.
