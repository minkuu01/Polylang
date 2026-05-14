# 🚀 PolyLang Deployment Guide

Complete guide to deploy PolyLang across Supabase (Database), Render (Backend), and Vercel (Frontend).

---

## 📋 Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Accounts on:
  - [Supabase](https://supabase.com) or [Neon](https://neon.tech)
  - [Render](https://render.com)
  - [Vercel](https://vercel.com)

---

## 🗄️ Step 1: Database Setup (Supabase)

### Option A: Supabase (Recommended for beginners)

1. **Sign up** at [supabase.com](https://supabase.com)

2. **Create a new project**
   - Project name: `polylang`
   - Database password: (choose a strong password)
   - Region: Choose closest to your users

3. **Get connection details**
   - Go to **Settings** → **Database**
   - Find **Connection string** section
   - Copy the **URI** (looks like: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)

4. **Note these values** (you'll need them for Render):
   ```
   DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   DATABASE_USERNAME=postgres.[project-ref]
   DATABASE_PASSWORD=[your-password]
   ```

### Option B: Neon (Alternative)

1. **Sign up** at [neon.tech](https://neon.tech)

2. **Create a new project**
   - Project name: `polylang`
   - Region: Choose closest to your users

3. **Get connection string**
   - Copy the connection string from the dashboard
   - Format: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`

4. **Note these values**:
   ```
   DATABASE_URL=[full connection string]
   DATABASE_USERNAME=[user from connection string]
   DATABASE_PASSWORD=[password from connection string]
   ```

---

## 🖥️ Step 2: Backend Setup (Render)

### 2.1 Push Code to Git

Make sure your code is pushed to GitHub/GitLab:

```bash
git add .
git commit -m "Configure for deployment"
git push origin main
```

### 2.2 Deploy on Render

1. **Sign up** at [render.com](https://render.com)

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your Git repository
   - Select your repository

3. **Configure the service**
   
   | Setting | Value |
   |---------|-------|
   | **Name** | `polylang-backend` |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` |
   | **Root Directory** | Leave empty |
   | **Runtime** | `Java` |
   | **Build Command** | `cd backend && ./mvnw clean package -DskipTests` |
   | **Start Command** | `cd backend && java -Dserver.port=$PORT -jar target/polylang-1.0.0.jar` |
   | **Plan** | `Free` |

4. **Add Environment Variables**
   
   Click **"Advanced"** → **"Add Environment Variable"**:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `DATABASE_URL` | (from Supabase/Neon) | Full connection string |
   | `DATABASE_USERNAME` | (from Supabase/Neon) | Database username |
   | `DATABASE_PASSWORD` | (from Supabase/Neon) | Database password |
   | `GROQ_API_KEY` | `gsk_...` | Your Groq API key (get from https://console.groq.com) |
   | `DB_POOL_SIZE` | `5` | Connection pool size |
   | `JAVA_VERSION` | `21` | Java version |

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for the build to complete
   - Once deployed, you'll get a URL like: `https://polylang-backend.onrender.com`

6. **Test the backend**
   ```bash
   curl https://polylang-backend.onrender.com/api/health
   ```
   
   Expected response:
   ```json
   {"status":"UP","service":"PolyLang"}
   ```

### 2.3 Note Your Backend URL

Copy your Render URL (e.g., `https://polylang-backend.onrender.com`) - you'll need it for Vercel.

---

## 🎨 Step 3: Frontend Setup (Vercel)

### 3.1 Deploy on Vercel

1. **Sign up** at [vercel.com](https://vercel.com)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Import your Git repository
   - Select your repository

3. **Configure Project**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Next.js` |
   | **Root Directory** | `frontend/polylang-app` |
   | **Build Command** | `npm run build` (auto-detected) |
   | **Output Directory** | `.next` (auto-detected) |
   | **Install Command** | `npm install` (auto-detected) |

4. **Add Environment Variable**
   
   Click **"Environment Variables"**:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://polylang-backend.onrender.com` |

   ⚠️ **Important:** Replace with YOUR actual Render backend URL!

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - You'll get a URL like: `https://polylang-app.vercel.app`

6. **Test the frontend**
   - Open your Vercel URL in a browser
   - Try generating code with a natural language instruction

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] **Database**: Can connect from Render backend
- [ ] **Backend Health**: `https://[your-render-url]/api/health` returns `{"status":"UP"}`
- [ ] **Frontend Loads**: Your Vercel URL opens successfully
- [ ] **API Connection**: Frontend can call backend APIs
- [ ] **Code Generation**: Test with a simple instruction like "print hello world"
- [ ] **Code Execution**: Execute the generated code
- [ ] **History**: Check if history is saved to database

---

## 🔧 Post-Deployment Configuration

### Update Local Development

Update your local `.env.local` to test against production backend:

```bash
# frontend/polylang-app/.env.local
NEXT_PUBLIC_API_URL=https://polylang-backend.onrender.com
```

### Custom Domain (Optional)

#### For Vercel (Frontend):
1. Go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

#### For Render (Backend):
1. Go to your service → **Settings** → **Custom Domains**
2. Add your custom domain
3. Update DNS records as instructed

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Build fails on Render
- **Solution:** Check Java version is set to 21 in environment variables
- **Solution:** Ensure `mvnw` has execute permissions (should be in Git)

**Problem:** Database connection fails
- **Solution:** Verify `DATABASE_URL` includes `?sslmode=require` for Neon
- **Solution:** Check Supabase connection pooler URL (port 6543, not 5432)
- **Solution:** Verify database credentials are correct

**Problem:** Backend returns 500 errors
- **Solution:** Check Render logs: Dashboard → Logs
- **Solution:** Verify `GROQ_API_KEY` is set correctly

### Frontend Issues

**Problem:** API calls fail with CORS errors
- **Solution:** Backend should already have CORS configured in `WebConfig.java`
- **Solution:** Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel

**Problem:** Environment variable not working
- **Solution:** Redeploy after adding environment variables
- **Solution:** Ensure variable name starts with `NEXT_PUBLIC_`

**Problem:** Build fails on Vercel
- **Solution:** Check root directory is set to `frontend/polylang-app`
- **Solution:** Verify `package.json` has correct build script

### Database Issues

**Problem:** Connection pool exhausted
- **Solution:** Reduce `DB_POOL_SIZE` to 3 on Render free tier
- **Solution:** Use Supabase connection pooler (port 6543)

**Problem:** Tables not created
- **Solution:** Check `spring.jpa.hibernate.ddl-auto=update` in `application.properties`
- **Solution:** Verify database user has CREATE TABLE permissions

---

## 💰 Cost Breakdown

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Supabase** | ✅ Free | 500MB database, 2 projects |
| **Neon** | ✅ Free | 512MB database, 1 project |
| **Render** | ✅ Free | 512MB RAM, spins down after 15min inactivity |
| **Vercel** | ✅ Free | 100GB bandwidth, unlimited deployments |

**Total Cost:** $0/month for hobby projects! 🎉

---

## 🔄 Continuous Deployment

All three platforms support automatic deployments:

- **Push to `main` branch** → Automatically deploys to all platforms
- **Pull requests** → Vercel creates preview deployments
- **Rollback** → Easy rollback in each platform's dashboard

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Spring Boot on Render](https://render.com/docs/deploy-spring-boot)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the **Logs** in each platform's dashboard
2. Verify all environment variables are set correctly
3. Test each component independently (DB → Backend → Frontend)
4. Check the troubleshooting section above

---

**🎉 Congratulations!** Your PolyLang app is now live on the internet!

Share your Vercel URL and start translating natural language to code! 🚀
