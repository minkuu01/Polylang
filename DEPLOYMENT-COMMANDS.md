# 🖥️ Deployment Commands Reference

Quick reference for all commands you'll need during deployment.

---

## 📦 Git Commands

### Initial Setup
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Configure for deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/polylang.git

# Push to GitHub
git push -u origin main
```

### Subsequent Deployments
```bash
# After making changes
git add .
git commit -m "Your commit message"
git push origin main
```

---

## 🧪 Testing Commands

### Test Backend Locally
```bash
# Navigate to backend
cd backend

# Run Spring Boot
./mvnw spring-boot:run

# In another terminal, test health endpoint
curl http://localhost:8080/api/health
```

### Test Frontend Locally
```bash
# Navigate to frontend
cd frontend/polylang-app

# Install dependencies (first time only)
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Test Backend on Render
```bash
# Replace with your actual Render URL
curl https://polylang-backend.onrender.com/api/health

# Expected response:
# {"status":"UP","service":"PolyLang"}
```

### Test Full API Flow
```bash
# Test code generation (replace URL with your Render backend)
curl -X POST https://polylang-backend.onrender.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "instruction": "print hello world",
    "targetLanguage": "python"
  }'

# Test code execution
curl -X POST https://polylang-backend.onrender.com/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"hello world\")",
    "language": "python"
  }'

# Test history
curl https://polylang-backend.onrender.com/api/history
```

---

## 🗄️ Database Commands

### Supabase (via psql)
```bash
# Connect to Supabase database
psql "postgresql://postgres.[ref]:[password]@[host]:6543/postgres"

# List tables
\dt

# View execution history
SELECT * FROM execution_history ORDER BY created_at DESC LIMIT 10;

# Count records
SELECT COUNT(*) FROM execution_history;

# Exit
\q
```

### Neon (via psql)
```bash
# Connect to Neon database
psql "postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"

# Same commands as above
```

---

## 🔍 Debugging Commands

### Check Render Logs
```bash
# Via Render CLI (if installed)
render logs -s polylang-backend

# Or visit: https://dashboard.render.com → Your Service → Logs
```

### Check Vercel Logs
```bash
# Via Vercel CLI (if installed)
vercel logs

# Or visit: https://vercel.com/dashboard → Your Project → Deployments
```

### Check Local Backend Logs
```bash
# Logs are in backend/logs/
cat backend/logs/backend.out.log
cat backend/logs/backend.err.log
```

---

## 🔧 Build Commands

### Backend Build (Local)
```bash
cd backend

# Clean and build
./mvnw clean package

# Skip tests (faster)
./mvnw clean package -DskipTests

# Run the JAR directly
java -jar target/polylang-1.0.0.jar
```

### Frontend Build (Local)
```bash
cd frontend/polylang-app

# Build for production
npm run build

# Start production server
npm start
```

---

## 🌐 Environment Variable Commands

### Set Environment Variables (Local)

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://localhost:5432/polylang"
$env:GROQ_API_KEY="gsk_..."
```

**Windows (CMD):**
```cmd
set DATABASE_URL=postgresql://localhost:5432/polylang
set GROQ_API_KEY=gsk_...
```

**Linux/Mac:**
```bash
export DATABASE_URL="postgresql://localhost:5432/polylang"
export GROQ_API_KEY="gsk_..."
```

### Check Environment Variables

**Windows (PowerShell):**
```powershell
echo $env:DATABASE_URL
```

**Windows (CMD):**
```cmd
echo %DATABASE_URL%
```

**Linux/Mac:**
```bash
echo $DATABASE_URL
```

---

## 🚀 Deployment Commands

### Deploy to Render
```bash
# Render auto-deploys on git push
git push origin main

# Or manually trigger from dashboard:
# https://dashboard.render.com → Your Service → Manual Deploy
```

### Deploy to Vercel
```bash
# Vercel auto-deploys on git push
git push origin main

# Or use Vercel CLI:
npm i -g vercel
cd frontend/polylang-app
vercel --prod
```

---

## 🔄 Rollback Commands

### Rollback on Render
```bash
# Via dashboard:
# https://dashboard.render.com → Your Service → Deploys → Rollback

# Or redeploy a specific commit:
git revert HEAD
git push origin main
```

### Rollback on Vercel
```bash
# Via dashboard:
# https://vercel.com/dashboard → Your Project → Deployments → Promote to Production

# Or via CLI:
vercel rollback
```

---

## 🧹 Cleanup Commands

### Clear Local Build Artifacts
```bash
# Backend
cd backend
./mvnw clean

# Frontend
cd frontend/polylang-app
rm -rf .next node_modules
npm install
```

### Clear Database (Careful!)
```bash
# Connect to database
psql "your-connection-string"

# Drop all tables (DESTRUCTIVE!)
DROP TABLE execution_history CASCADE;

# Or clear data only
DELETE FROM execution_history;
```

---

## 📊 Monitoring Commands

### Check Backend Status
```bash
# Health check
curl https://polylang-backend.onrender.com/api/health

# Check response time
time curl https://polylang-backend.onrender.com/api/health
```

### Check Database Connection
```bash
# From backend directory
cd backend

# Run a simple test
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.jpa.show-sql=true"
```

### Monitor Logs in Real-Time

**Render:**
```bash
# Via CLI
render logs -s polylang-backend --tail

# Or visit dashboard and enable auto-refresh
```

**Vercel:**
```bash
# Via CLI
vercel logs --follow

# Or visit dashboard
```

---

## 🔐 Security Commands

### Rotate API Keys
```bash
# 1. Get new Groq API key from https://console.groq.com
# 2. Update in Render dashboard:
#    Dashboard → Your Service → Environment → Edit → Update GROQ_API_KEY
# 3. Redeploy (automatic)
```

### Update Database Password
```bash
# 1. Change password in Supabase/Neon dashboard
# 2. Update in Render:
#    Dashboard → Your Service → Environment → Edit → Update DATABASE_PASSWORD
# 3. Redeploy (automatic)
```

---

## 🆘 Emergency Commands

### Backend Won't Start
```bash
# Check Java version
java -version  # Should be 21+

# Check Maven
./mvnw --version

# Test database connection
psql "your-connection-string"
```

### Frontend Build Fails
```bash
# Clear cache and reinstall
cd frontend/polylang-app
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues
```bash
# Test connection
psql "your-connection-string"

# If fails, check:
# 1. Is database running?
# 2. Is connection string correct?
# 3. Is SSL required? (add ?sslmode=require)
# 4. Is IP whitelisted? (Supabase/Neon allow all by default)
```

---

## 📝 Useful Aliases (Optional)

Add these to your shell profile for faster commands:

```bash
# Backend
alias backend-run="cd backend && ./mvnw spring-boot:run"
alias backend-build="cd backend && ./mvnw clean package -DskipTests"
alias backend-test="curl http://localhost:8080/api/health"

# Frontend
alias frontend-run="cd frontend/polylang-app && npm run dev"
alias frontend-build="cd frontend/polylang-app && npm run build"

# Deployment
alias deploy="git add . && git commit -m 'Deploy' && git push origin main"

# Testing
alias test-backend="curl https://polylang-backend.onrender.com/api/health"
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Run backend locally | `cd backend && ./mvnw spring-boot:run` |
| Run frontend locally | `cd frontend/polylang-app && npm run dev` |
| Deploy everything | `git push origin main` |
| Test backend health | `curl https://your-backend.onrender.com/api/health` |
| View Render logs | Visit dashboard → Logs |
| View Vercel logs | Visit dashboard → Deployments |
| Rollback | Use platform dashboard |

---

**💡 Tip:** Bookmark this file for quick reference during deployment and maintenance!
