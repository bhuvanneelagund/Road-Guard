# ROADGUARD AI - Production Deployment Guide

Deploying RoadGuard AI:
* **Frontend**: Vercel (Global Edge Network)
* **Backend**: Render (Cloud Web Service)
* **Database**: MongoDB Atlas (Free M0 Cluster)

---

## 1. Backend Deployment on Render

### Step 1.1: Push Code to GitHub
Ensure your repository contains the `backend/` directory and `backend/requirements.txt`.

### Step 1.2: Create a Web Service on Render
1. Log in to [https://render.com](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   * **Name**: `roadguard-ai-backend`
   * **Root Directory**: `backend`
   * **Environment**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Plan**: Free

### Step 1.3: Set Environment Variables in Render Dashboard
Under **Environment Variables**, add:
* `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/roadguard_ai?retryWrites=true&w=majority`
* `DATABASE_NAME`: `roadguard_ai`
* `JWT_SECRET`: `generate_a_random_32_character_secret`
* `ENABLE_DEMO_FALLBACK`: `True`
* `CONFIDENCE_THRESHOLD`: `0.35`
* `CORS_ORIGINS`: `["https://your-frontend.vercel.app", "http://localhost:5173"]`

Click **Deploy Web Service**. Note your Render public URL (e.g. `https://roadguard-ai-backend.onrender.com`).

---

## 2. Frontend Deployment on Vercel

### Step 2.1: Import Project in Vercel
1. Log in to [https://vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Select your GitHub repository.
3. In Project Configuration:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Click Edit and select `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`

### Step 2.2: Set Environment Variables
Add:
* `VITE_API_URL`: `https://roadguard-ai-backend.onrender.com/api`

### Step 2.3: SPA Routing (Vercel Rewrites)
To ensure React Router handles client-side routing on page refresh, verify `frontend/vercel.json` exists:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Click **Deploy**. Your professional RoadGuard AI dashboard will be live on Vercel!
