# ⚡ Quick Start - Deploy in 20 Minutes

Follow these steps in order to deploy PolyLang to production.

---

## 🎯 Step-by-Step Checklist

### ☑️ Step 1: Database (5 minutes)

**Choose Supabase (easier) or Neon:**

#### Supabase:
1. Go to [supabase.com](https://supabase.com) → Sign up
2. Click **"New Project"**
3. Name: `polylang`, Password: (create strong password)
4. Wait 2 minutes for setup
5. Go to **Settings** → **Database** → **Connection string**
6. Copy the **URI** (Connection pooling mode)
7. **Save these for Step 2:**
   ```
   DATABASE_URL=postgresql://postgres.[ref]:[password]@[host]:6543/postgres
   DATABASE_USERNAME=postgres.[ref]
   DATABASE_PASSWORD=[your-password]
   ```

#### Neon (Alternative):
1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create project: `polylang`
3. Copy connection string from dashboard
4. **Save for Step 2**

---

### ☑️ Step 2: Backend (10 minutes)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [render.com](https://render.com)** → Sign up

3. **Click "New +" → "Web Service"**

4. **Connect your GitHub repository**

5. **Fill in these settings:**
   - Name: `polylang-backend`
   - Runtime: `Java`
   - Build Command: `cd backend && ./mvnw clean package -DskipTests`
   - Start Command: `cd backend && java -Dserver.port=$PORT -jar target/polylang-1.0.0.jar`

6. **Click "Advanced" → Add these Environment Variables:**
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (paste from Step 1) |
   | `DATABASE_USERNAME` | (paste from Step 1) |
   | `DATABASE_PASSWORD` | (paste from Step 1) |
   | `GROQ_API_KEY` | `gsk_...` (get from https://console.groq.com) |
   | `JAVA_VERSION` | `21` |
   | `DB_POOL_SIZE` | `5` |

7. **Click "Create Web Service"**

8. **Wait 5-10 minutes** for build to complete

9. **Copy your backend URL** (e.g., `https://polylang-backend.onrender.com`)

10. **Test it:**
    ```bash
    curl https://polylang-backend.onrender.com/api/health
    ```
    Should return: `{"status":"UP","service":"PolyLang"}`

---

### ☑️ Step 3: Frontend (5 minutes)

1. **Go to [vercel.com](https://vercel.com)** → Sign up

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository**

4. **Configure:**
   - Framework: `Next.js` (auto-detected)
   - Root Directory: `frontend/polylang-app`
   - Build Command: `npm run build` (auto-detected)

5. **Add Environment Variable:**
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://polylang-backend.onrender.com` (YOUR Render URL from Step 2)

6. **Click "Deploy"**

7. **Wait 2-3 minutes**

8. **Open your Vercel URL** (e.g., `https://polylang-app.vercel.app`)

---

## ✅ Verify Everything Works

1. Open your Vercel URL in browser
2. Type a natural language instruction: `"print hello world"`
3. Select target language: `Python`
4. Click **Generate Code**
5. Click **Execute Code**
6. Check **History** tab

**If all steps work → You're live! 🎉**

---

## 🐛 Something Not Working?

### Backend won't start:
- Check Render logs (Dashboard → Logs)
- Verify `JAVA_VERSION=21` is set
- Verify database credentials are correct

### Frontend can't connect to backend:
- Check `NEXT_PUBLIC_API_URL` in Vercel settings
- Make sure it's your Render URL (not localhost!)
- Redeploy frontend after adding env variable

### Database connection fails:
- For Supabase: Use connection pooler URL (port 6543)
- For Neon: Ensure `?sslmode=require` is in connection string
- Check database password is correct

---

## 📖 Full Documentation

For detailed troubleshooting and advanced configuration, see [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**🚀 That's it! Your app is live on the internet!**
