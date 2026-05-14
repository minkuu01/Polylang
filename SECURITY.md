# 🔐 Security Configuration Guide

## Overview

This guide explains how secrets and sensitive configuration are managed in PolyLang to keep them secure and out of Git.

---

## 🎯 Security Principles

### ✅ What's Safe to Commit
- `application.properties` - Contains NO secrets, only placeholders
- `application-local.properties.example` - Template with fake values
- `.env.example` - Template with fake values
- All code files

### ❌ What's NEVER Committed
- `application-local.properties` - Contains real secrets (gitignored)
- `.env` - Contains real secrets (gitignored)
- Any file with real API keys, passwords, or tokens

---

## 🏗️ Configuration Architecture

### Spring Boot Multi-Profile Setup

```
backend/src/main/resources/
├── application.properties              ← Base config (NO SECRETS) ✅ Committed
├── application-local.properties        ← Local secrets ❌ Gitignored
└── application-local.properties.example ← Template ✅ Committed
```

### How It Works

1. **Base Configuration** (`application.properties`)
   - Contains all non-sensitive settings
   - Uses environment variable placeholders: `${GROQ_API_KEY}`
   - Safe to commit to Git

2. **Local Development** (`application-local.properties`)
   - Contains actual secrets for local development
   - Automatically loaded when profile is active
   - **NEVER committed** (in .gitignore)

3. **Production** (Environment Variables)
   - Secrets set in Render dashboard
   - No files needed, Spring Boot reads from environment

---

## 🚀 Setup for Different Environments

### 1️⃣ Local Development Setup

#### Option A: Using application-local.properties (Recommended)

1. **Copy the example file:**
   ```bash
   cd backend/src/main/resources
   cp application-local.properties.example application-local.properties
   ```

2. **Edit `application-local.properties` with your real credentials:**
   ```properties
   DATABASE_URL=jdbc:postgresql://localhost:5432/polylang
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_actual_password
   GROQ_API_KEY=your_actual_groq_key
   ```

3. **Run with local profile:**
   ```bash
   cd backend
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
   ```

#### Option B: Using Environment Variables

1. **Set environment variables:**
   
   **Windows (PowerShell):**
   ```powershell
   $env:DATABASE_URL="jdbc:postgresql://localhost:5432/polylang"
   $env:DATABASE_USERNAME="postgres"
   $env:DATABASE_PASSWORD="your_password"
   $env:GROQ_API_KEY="your_groq_key"
   ```

   **Linux/Mac:**
   ```bash
   export DATABASE_URL="jdbc:postgresql://localhost:5432/polylang"
   export DATABASE_USERNAME="postgres"
   export DATABASE_PASSWORD="your_password"
   export GROQ_API_KEY="your_groq_key"
   ```

2. **Run normally:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

#### Option C: Using .env file (with spring-dotenv)

1. **Create `.env` file in backend directory:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` with your credentials:**
   ```env
   DATABASE_URL=jdbc:postgresql://localhost:5432/polylang
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your_password
   GROQ_API_KEY=your_groq_key
   ```

3. **Run normally** (Spring Boot will auto-load .env)

---

### 2️⃣ Production Setup (Render)

**No files needed!** Set environment variables in Render dashboard:

1. Go to Render Dashboard → Your Service → Environment
2. Add variables:
   - `DATABASE_URL`
   - `DATABASE_USERNAME`
   - `DATABASE_PASSWORD`
   - `GROQ_API_KEY`
3. Render automatically injects these into your app

---

## 🔍 How Spring Boot Resolves Configuration

Spring Boot loads configuration in this order (later overrides earlier):

1. `application.properties` (base config)
2. `application-{profile}.properties` (profile-specific)
3. Environment variables (highest priority)

### Example Resolution

**application.properties:**
```properties
groq.api.key=${GROQ_API_KEY}
```

**Spring Boot looks for `GROQ_API_KEY` in:**
1. Environment variables (e.g., set in Render)
2. `application-local.properties` (if profile=local)
3. System properties
4. If not found → Error (no default for security)

---

## ✅ Verification Checklist

### Before Committing to Git

- [ ] `application.properties` has NO hardcoded secrets
- [ ] All secrets use `${VARIABLE_NAME}` syntax
- [ ] `application-local.properties` is in `.gitignore`
- [ ] `.env` is in `.gitignore`
- [ ] Example files (`.example`) have fake values only

### Test Your Setup

```bash
# 1. Check what's being committed
git status

# 2. Search for potential secrets in staged files
git diff --cached | grep -i "password\|key\|secret"

# 3. Verify .gitignore is working
git check-ignore backend/src/main/resources/application-local.properties
# Should output: backend/src/main/resources/application-local.properties

# 4. Check for accidentally committed secrets
git log -p | grep -i "gsk_\|password"
```

---

## 🚨 What If Secrets Were Already Committed?

### If you accidentally committed secrets:

1. **Immediately rotate the secrets:**
   - Get new Groq API key from https://console.groq.com
   - Change database password

2. **Remove from Git history:**
   ```bash
   # Remove file from Git but keep locally
   git rm --cached backend/src/main/resources/application-local.properties
   
   # Commit the removal
   git commit -m "Remove secrets from Git"
   
   # Push
   git push origin main
   ```

3. **For complete history cleanup (advanced):**
   ```bash
   # Use git-filter-repo (install first)
   git filter-repo --path backend/src/main/resources/application-local.properties --invert-paths
   
   # Force push (WARNING: rewrites history)
   git push origin main --force
   ```

4. **Update .gitignore and commit:**
   ```bash
   git add .gitignore
   git commit -m "Add application-local.properties to gitignore"
   git push origin main
   ```

---

## 🔐 Best Practices

### DO ✅

- Use environment variables for all secrets
- Keep example files with fake values
- Use different secrets for dev/staging/production
- Rotate secrets regularly
- Use strong, unique passwords
- Document required environment variables

### DON'T ❌

- Hardcode secrets in code
- Commit files with real secrets
- Share secrets in chat/email
- Use the same secrets across environments
- Store secrets in comments
- Push secrets to public repositories

---

## 📋 Required Environment Variables

### For Local Development

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/polylang` | Your local PostgreSQL |
| `DATABASE_USERNAME` | `postgres` | Your local PostgreSQL |
| `DATABASE_PASSWORD` | `your_password` | Your local PostgreSQL |
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com |

### For Production (Render)

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Supabase/Neon dashboard |
| `DATABASE_USERNAME` | `postgres.abc123` | Supabase/Neon dashboard |
| `DATABASE_PASSWORD` | `secure_password` | Supabase/Neon dashboard |
| `GROQ_API_KEY` | `gsk_...` | https://console.groq.com |
| `JAVA_VERSION` | `21` | Fixed value |
| `DB_POOL_SIZE` | `5` | Fixed value |

---

## 🔄 Team Collaboration

### For New Team Members

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/polylang.git
   cd polylang
   ```

2. **Set up local secrets:**
   ```bash
   cd backend/src/main/resources
   cp application-local.properties.example application-local.properties
   ```

3. **Ask team lead for:**
   - Local database credentials
   - Groq API key (or get your own)

4. **Update `application-local.properties` with real values**

5. **Never commit `application-local.properties`**

### Sharing Secrets Securely

**DON'T:** Send via email, Slack, or commit to Git

**DO:** Use secure methods:
- 1Password / LastPass (shared vaults)
- Bitwarden (organization)
- HashiCorp Vault
- AWS Secrets Manager
- In-person / encrypted channels

---

## 🧪 Testing Security

### Check for Leaked Secrets

```bash
# Search for potential API keys in code
grep -r "gsk_" backend/src/

# Search for passwords
grep -r "password.*=" backend/src/

# Check what's in Git
git log --all --full-history --source --pretty=format: | grep -i "password\|secret\|key"
```

### Automated Tools

```bash
# Install git-secrets
git secrets --install
git secrets --register-aws

# Scan repository
git secrets --scan

# Install truffleHog (finds secrets in Git history)
pip install truffleHog
truffleHog --regex --entropy=False .
```

---

## 📚 Additional Resources

- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [12-Factor App Config](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Git Secrets Tool](https://github.com/awslabs/git-secrets)

---

## 🆘 Questions?

- **Q: Can I use default values for local development?**
  - A: Yes, but only in `application-local.properties` (gitignored), never in `application.properties`

- **Q: What if I need different secrets for different developers?**
  - A: Each developer maintains their own `application-local.properties` (never committed)

- **Q: How do I know if my secrets are secure?**
  - A: Run `git log -p | grep -i "gsk_"` - should return nothing

- **Q: Can I use Spring Cloud Config Server?**
  - A: Yes! For larger teams, consider centralized config management

---

**🔒 Remember: Security is not optional. Protect your secrets!**
