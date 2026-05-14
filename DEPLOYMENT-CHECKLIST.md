# ✅ Deployment Checklist

Use this checklist to track your deployment progress.

---

## 📋 Pre-Deployment

- [ ] Code is committed to Git
- [ ] Code is pushed to GitHub/GitLab
- [ ] You have accounts on Supabase/Neon, Render, and Vercel
- [ ] You have your Groq API key ready

---

## 🗄️ Database Setup (Supabase/Neon)

- [ ] Created account on Supabase or Neon
- [ ] Created new project named "polylang"
- [ ] Copied connection string
- [ ] Noted down these values:
  - [ ] `DATABASE_URL`
  - [ ] `DATABASE_USERNAME`
  - [ ] `DATABASE_PASSWORD`

---

## 🖥️ Backend Setup (Render)

- [ ] Created account on Render
- [ ] Created new Web Service
- [ ] Connected GitHub repository
- [ ] Set runtime to Java
- [ ] Set build command: `cd backend && ./mvnw clean package -DskipTests`
- [ ] Set start command: `cd backend && java -Dserver.port=$PORT -jar target/polylang-1.0.0.jar`
- [ ] Added environment variables:
  - [ ] `DATABASE_URL`
  - [ ] `DATABASE_USERNAME`
  - [ ] `DATABASE_PASSWORD`
  - [ ] `GROQ_API_KEY`
  - [ ] `JAVA_VERSION=21`
  - [ ] `DB_POOL_SIZE=5`
- [ ] Deployment completed successfully
- [ ] Copied backend URL (e.g., `https://polylang-backend.onrender.com`)
- [ ] Tested health endpoint: `curl https://[your-url]/api/health`

---

## 🎨 Frontend Setup (Vercel)

- [ ] Created account on Vercel
- [ ] Imported GitHub repository
- [ ] Set root directory to `frontend/polylang-app`
- [ ] Framework detected as Next.js
- [ ] Added environment variable:
  - [ ] `NEXT_PUBLIC_API_URL` = (your Render backend URL)
- [ ] Deployment completed successfully
- [ ] Copied frontend URL (e.g., `https://polylang-app.vercel.app`)

---

## ✅ Testing & Verification

- [ ] Frontend loads successfully
- [ ] Can enter natural language instruction
- [ ] Can select target programming language
- [ ] Code generation works
- [ ] Generated code appears in editor
- [ ] Code execution works
- [ ] Output displays correctly
- [ ] History tab shows saved records
- [ ] Can clear history
- [ ] No console errors in browser

---

## 🔧 Post-Deployment (Optional)

- [ ] Set up custom domain for frontend (Vercel)
- [ ] Set up custom domain for backend (Render)
- [ ] Updated README with live demo link
- [ ] Shared project with friends/portfolio
- [ ] Set up monitoring/alerts (optional)

---

## 📝 Important URLs to Save

Write down your deployment URLs:

```
Database (Supabase/Neon):
Connection String: _________________________________

Backend (Render):
URL: _________________________________
Dashboard: https://dashboard.render.com

Frontend (Vercel):
URL: _________________________________
Dashboard: https://vercel.com/dashboard

GitHub Repository:
URL: _________________________________
```

---

## 🐛 Troubleshooting Reference

If something goes wrong, check:

1. **Render Logs**: Dashboard → Your Service → Logs
2. **Vercel Logs**: Dashboard → Your Project → Deployments → View Function Logs
3. **Browser Console**: F12 → Console tab
4. **Network Tab**: F12 → Network tab (check API calls)

Common issues and solutions in [DEPLOYMENT.md](./DEPLOYMENT.md#-troubleshooting)

---

## 🎉 Success!

Once all checkboxes are ticked, your app is live! 🚀

Share your live URL:
- Add to your portfolio
- Share on LinkedIn/Twitter
- Add to your resume
- Show to potential employers

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
