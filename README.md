## 🚀 Deployment Guide

### 🌐 Backend on Render

1. **Create a new Web Service** on [Render](https://render.com).
   - **Root Directory:** `backend`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

2. **Environment Variables** (add in Render dashboard):
   | Key             | Value / Example                        |
   |-----------------|----------------------------------------|
   | `DATABASE_URL`  | `sqlite:///./ppt_generator.db` or PostgreSQL URL |
   | `GEMINI_API_KEY`| Your production Gemini key             |
   | `SECRET`        | Strong random JWT secret               |
   | `FRONTEND_URL`  | Deployed frontend URL, e.g. `https://your-frontend.vercel.app` |

3. **Copy the Render backend URL**, e.g.:
   ```
   https://your-backend.onrender.com
   ```

---

### 💻 Frontend on Vercel

1. In the root project **or** `frontend/ai-doc-frontend`, ensure code is pushed to GitHub.
2. On [Vercel](https://vercel.com):
   - **Import Project:** Select your repo via GitHub.
   - **Root Directory:** `frontend/ai-doc-frontend`
   - **Add Environment Variable:**
     | Key               | Value                              |
     |-------------------|------------------------------------|
     | `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api/v1` |

   - **Click Deploy.**  
     Vercel will automatically use `npm install` and `npm run build` from your `package.json`.

---

### 🧪 Quick Local Run Summary

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # or source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd ../frontend/ai-doc-frontend
npm install
npm run dev
```

---

You’re done – backend + frontend + `.env` + deployment!