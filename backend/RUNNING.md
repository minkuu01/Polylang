# 🚀 PolyLang Backend — Running Guide

## Tech Stack
- **Framework:** Spring Boot 3.2.5
- **Language:** Java 21
- **Database:** PostgreSQL
- **Build Tool:** Maven (via Maven Wrapper `mvnw.cmd`)
- **Port:** `8080`

---

## ✅ Prerequisites

| Tool | Version Required | Check Command |
|------|-----------------|---------------|
| Java JDK | 21+ | `java -version` |
| PostgreSQL | Any recent | Check pgAdmin or services |

> **No need to install Maven separately** — the project includes `mvnw.cmd` (Maven Wrapper).

---

## 🗄️ Database Setup

Make sure PostgreSQL is running and a database named `polylang` exists.

```sql
-- Run this in pgAdmin or psql
CREATE DATABASE polylang;
```

---

## 🔐 Configuration Setup (IMPORTANT!)

### Step 1: Set Up Local Secrets

The project uses secure configuration management. Secrets are NOT in Git.

**Copy the example file:**
```bash
cd backend/src/main/resources
cp application-local.properties.example application-local.properties
```

**Edit `application-local.properties` with your credentials:**
```properties
DATABASE_URL=jdbc:postgresql://localhost:5432/polylang
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_actual_password
GROQ_API_KEY=your_groq_api_key
```

> ⚠️ **NEVER commit `application-local.properties`** - it's gitignored for security

### Step 2: Get Your Groq API Key

1. Go to https://console.groq.com
2. Sign up / Log in
3. Create a new API key
4. Copy it to `application-local.properties`

---

## ▶️ How to Run

### Option 1 — Using Command Prompt (Recommended on Windows)

```cmd
cd backend
cmd /c "mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local"
```

### Option 2 — Using PowerShell (if execution policy allows)

```powershell
cd backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
```

### Option 3 — Using Environment Variables

Set environment variables first:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/polylang"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="your_password"
$env:GROQ_API_KEY="your_groq_key"
```

**Then run:**
```powershell
.\mvnw.cmd spring-boot:run
```

> ⚠️ If PowerShell blocks the script with a security error, use **Option 1** (cmd).

---

## ✅ Successful Startup Output

When the backend starts successfully, you will see:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.5)

INFO : HikariPool-1 - Start completed.
INFO : Tomcat started on port 8080 (http)
INFO : Started PolyLangApplication in ~5 seconds
```

---

## 🌐 API Base URL

```
http://localhost:8080
```

All frontend API calls are proxied through Next.js to this address.

---

## 🔑 External API Configuration

Configured via environment variables (see SECURITY.md):

| Service | Purpose | Key Required |
|---------|---------|-------------|
| **Groq API** | LLM (Llama 3.3 70B) for NL → Code | ✅ Yes (get from console.groq.com) |
| **Wandbox API** | Online code execution | ❌ No key needed |
| **MyMemory API** | Translation | ❌ No key needed |

---

## 🛑 How to Stop

Press `Ctrl + C` in the terminal where the backend is running.

---

## 🐛 Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| `npm.ps1 cannot be loaded` | PowerShell execution policy | Use `cmd /c "mvnw.cmd spring-boot:run"` |
| `Connection refused` on port 5432 | PostgreSQL not running | Start PostgreSQL service |
| `Database "polylang" does not exist` | DB not created | Run `CREATE DATABASE polylang;` in psql |
| Port 8080 already in use | Another process on 8080 | Kill the process or change `server.port` |
| `Could not resolve placeholder 'DATABASE_URL'` | Missing configuration | Create `application-local.properties` from example |
| `Invalid API key` | Wrong Groq key | Check your key at console.groq.com |

---

## 🔐 Security Note

- **NEVER commit** `application-local.properties` to Git
- **NEVER share** your API keys publicly
- See [SECURITY.md](../SECURITY.md) for detailed security guidelines

---

## 📚 Additional Documentation

- [SECURITY.md](../SECURITY.md) - Security configuration guide
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment guide
- [QUICK-START.md](../QUICK-START.md) - Quick deployment guide
