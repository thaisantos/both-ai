# Both AI v1 - Installation & Running Guide

## 🚀 Quick Start

### Option 1: Direct Installation (Recommended)

#### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

#### Windows
```cmd
setup.bat
```

#### Manual
```bash
npm install
npm start
```

---

## 🐳 Docker Installation

### Build and Run with Docker
```bash
docker build -t both-ai:v1 .
docker run -p 3000:3000 both-ai:v1
```

### Using Docker Compose
```bash
docker-compose up -d
```

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Container
```bash
docker-compose down
```

---

## ✅ Verify Installation

After starting the service, test it:

### Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "version": "1.0.0",
  "timestamp": "2026-09-05T12:00:00.000Z"
}
```

### Service Status
```bash
curl http://localhost:3000/api/v1/status
```

**Expected Response:**
```json
{
  "service": "Both AI",
  "version": "1.0.0",
  "status": "operational",
  "environment": "production"
}
```

### Process Data
```bash
curl -X POST http://localhost:3000/api/v1/process \
  -H "Content-Type: application/json" \
  -d '{"input": "test data"}'
```

**Expected Response:**
```json
{
  "success": true,
  "input": "test data",
  "processed": true,
  "timestamp": "2026-09-05T12:00:00.000Z"
}
```

---

## 🔧 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Change PORT in .env
echo "PORT=3001" >> .env
```

### Issue: Node.js not found
- Install Node.js from https://nodejs.org/ (version >= 14.0.0)

### Issue: npm install fails
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Permission denied (Linux/Mac)
```bash
chmod +x setup.sh
```

---

## 📊 Development Mode

Run with auto-reload:
```bash
npm run dev
```

---

## 🧪 Testing

```bash
npm test
```

---

## 📝 Scripts Available

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-reload |
| `npm test` | Run tests |
| `npm run lint` | Run linter |
| `npm run build` | Build project |

---

**Last Updated:** 2026-09-05
