# 🎯 Google Login Setup Checklist

Use this checklist to verify everything is configured correctly before testing.

---

## Phase 1: Google Cloud Console

- [ ] Visit [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project or select an existing one
- [ ] Enable **Google+ API** or **OAuth 2.0**
- [ ] Go to **Credentials** → **Create OAuth 2.0 Client ID**
- [ ] Choose **Web application**
- [ ] Add **Authorized redirect URIs:**
  - [ ] `http://localhost:5173`
  - [ ] `http://localhost:3000`
  - [ ] (Add production domain later)
- [ ] Add **Authorized JavaScript origins:**
  - [ ] `http://localhost:5173`
  - [ ] `http://localhost:3000`
  - [ ] `localhost`
- [ ] Copy your **Client ID** (format: `1234567890-abcdefg.apps.googleusercontent.com`)

---

## Phase 2: Backend Configuration

### Install Dependencies
- [ ] `google-auth` package is in `backend/requirements.txt`
- [ ] Run `pip install -r backend/requirements.txt`

### Set Environment Variables
- [ ] Create `backend/.env` (copy from `backend/.env.example` if unsure)
- [ ] Set `DATABASE_URL` to your Neon PostgreSQL connection string
  - [ ] Includes `?sslmode=require` parameter
  - [ ] Format: `postgresql://user:password@host:port/dbname?sslmode=require`
- [ ] Set `SECRET_KEY` to a random string (at least 32 chars)
  - [ ] Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] Set `GOOGLE_CLIENT_ID` to the Client ID from Google Console
- [ ] **Do NOT commit** `.env` file to git

### Database Schema
- [ ] Run migration if using existing database:
  ```bash
  cd backend
  python migrate_users.py
  ```
  - [ ] Verifies `hashed_password` is nullable
  - [ ] Ensures `google_id` is unique
  - [ ] Confirms `profile_picture` column exists

### Test Backend Health
- [ ] Start backend: `uvicorn main:app --reload`
- [ ] Visit `http://localhost:8000/api/health` (should return `{"status": "ok"}`)
- [ ] Visit `http://localhost:8000/docs` (Swagger UI)
- [ ] Find `/auth/google` POST endpoint in docs

---

## Phase 3: Frontend Configuration

### Set Environment Variables
- [ ] Create `.env` in root directory (same level as `package.json`)
- [ ] Copy from `.env.example` if provided
- [ ] Set `VITE_API_URL=http://localhost:8000`
- [ ] Set `VITE_GOOGLE_CLIENT_ID` to the same Client ID from Google Console
- [ ] **Verify** both backends use the **same Client ID**

### Verify Files Updated
- [ ] `src/pages/Login.tsx` has Google SDK loading (check for `accounts.google.com/gsi/client`)
- [ ] `src/hooks/useAuth.tsx` has `googleLogin()` function
- [ ] `src/types/google-identity.d.ts` exists with TypeScript types
- [ ] Login page shows **"Continue with Google"** button

### Install Dependencies
- [ ] `npm install` (if not done)

### Test Frontend
- [ ] Start frontend: `npm run dev`
- [ ] Open `http://localhost:5173` in browser
- [ ] Check browser console (F12 → Console tab) for errors
- [ ] **Expected:** No red errors about Google SDK

---

## Phase 4: Integration Testing

### Test Button Appearance
- [ ] Navigate to `http://localhost:5173`
- [ ] See "Continue with Google" button below email/password fields
- [ ] Button is styled consistently with form

### Test SDK Loading
- [ ] Open browser DevTools (F12)
- [ ] Go to **Network** tab
- [ ] Click "Continue with Google"
- [ ] **Expected:** `accounts.google.com/gsi/client` loads successfully
- [ ] **NOT expected:** CORS errors or 404s

### Test Account Popup
- [ ] Click "Continue with Google"
- [ ] **Expected:** Google account chooser popup appears
- [ ] If no popup:
  - [ ] Check browser console for errors
  - [ ] Verify `VITE_GOOGLE_CLIENT_ID` is correct
  - [ ] Ensure localhost is in Google Console authorized origins

### Test Complete Flow
- [ ] Click "Continue with Google"
- [ ] Select your Google account
- [ ] Approve permissions if prompted
- [ ] **Expected:** Redirected to `/home`
- [ ] **Expected:** See user profile picture (if available)
- [ ] **Expected:** Logged in state persists on page refresh

### Verify Database
- [ ] Check that user was created:
  ```bash
  psql <your-database-url>
  SELECT * FROM users WHERE email = '<your-email>';
  ```
  - [ ] `google_id` is populated
  - [ ] `hashed_password` is NULL
  - [ ] `profile_picture` is set
  - [ ] `username` is derived from email

### Verify JWT Token
- [ ] Open DevTools (F12) → **Application** tab
- [ ] **Storage** → **Local Storage** → `http://localhost:5173`
- [ ] Verify `labfinity_token` exists and looks like `eyJ...`
- [ ] Decode token at [jwt.io](https://jwt.io/) to verify payload

### Test Re-authentication
- [ ] Click "Sign Out"
- [ ] **Expected:** Redirected to login page
- [ ] **Expected:** `labfinity_token` removed from localStorage
- [ ] Click "Continue with Google" again (should not repeat account selection)

---

## Phase 5: Error Handling

### Common Issues & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| "Google SDK not loaded yet" | SDK script failed to load | Check browser console; verify CORS settings |
| CORS error when loading SDK | Domain not authorized | Add domain to Google Console **Authorized JavaScript origins** |
| "Invalid Google token" | Client ID mismatch | Verify same Client ID in `.env` and Google Console |
| "Email already registered" | Existing user with same email | Clear database or use different email |
| "hashed_password NOT NULL" | Old database schema | Run `python backend/migrate_users.py` |
| No profile picture displayed | Google account has no photo | This is normal; photo is optional |
| 500 error on backend | JWT verification failed | Check `google-auth` library is installed |

### Debug Logging
- [ ] Backend: Check `uvicorn` terminal for error messages
- [ ] Frontend: Open browser console (F12 → Console tab)
- [ ] Database: Check connection with `psql` directly
- [ ] Google Console: Ensure Client ID is correct and authorized origins are set

---

## Phase 6: Security Review

- [ ] `.env` file is in `.gitignore` (check `git status` — should NOT show `.env`)
- [ ] `SECRET_KEY` is a random 32+ character string (not "secret")
- [ ] `GOOGLE_CLIENT_ID` is NOT hardcoded in source files
- [ ] Frontend uses `import.meta.env.VITE_GOOGLE_CLIENT_ID` (from `.env`)
- [ ] Backend uses `os.getenv("GOOGLE_CLIENT_ID")` (from `.env`)
- [ ] Database connection includes `sslmode=require`
- [ ] `hashed_password` is NULL for Google users (security by design)
- [ ] Backend **verifies** all tokens (not trusting frontend claims)

---

## Phase 7: Production Preparation

### Before Deploying to Production

- [ ] Update Google Console:
  - [ ] Add production domain to **Authorized Redirect URIs**
  - [ ] Add production domain to **Authorized JavaScript origins**
  
- [ ] Backend environment:
  - [ ] Set `GOOGLE_CLIENT_ID` in production secrets manager
  - [ ] Set `SECRET_KEY` to a NEW random string (not dev secret)
  - [ ] Set `DATABASE_URL` to production Neon database
  - [ ] Update `ALLOWED_ORIGINS` in `main.py` CORS config
  
- [ ] Frontend environment:
  - [ ] Set `VITE_GOOGLE_CLIENT_ID` in build/deployment config
  - [ ] Set `VITE_API_URL` to production backend URL
  - [ ] Run `npm run build` and test production build
  
- [ ] Database:
  - [ ] Backup production database before migration
  - [ ] Verify `hashed_password` nullable constraint exists
  - [ ] Test user creation via Google login in staging

---

## Phase 8: Maintenance

### Regular Checks
- [ ] Monitor backend logs for auth errors
- [ ] Track Google API rate limits (usually not an issue for small apps)
- [ ] Verify certificate validity for database SSL connection
- [ ] Rotate `SECRET_KEY` periodically (requires re-logging all users)

### Future Enhancements
- [ ] Add "Link Account" feature (let email users link Google)
- [ ] Add profile editing (allow users to update name/picture)
- [ ] Add "Unlink Google" option
- [ ] Implement refresh tokens for longer sessions
- [ ] Add email verification for traditional signups

---

## ✅ Final Verification Script

Run these commands to verify setup:

```bash
# 1. Check environment files exist
ls backend/.env
ls .env

# 2. Check required packages installed (backend)
cd backend
python -c "import google.oauth2.id_token; print('google-auth OK')"

# 3. Check database connectivity
python -c "from db import engine; print('Database connection OK')"

# 4. Run backend on test port
uvicorn main:app --reload &
sleep 2
curl -X GET http://localhost:8000/api/health
kill %1

# 5. Check frontend env vars
cd ..
grep VITE_GOOGLE_CLIENT_ID .env
grep VITE_API_URL .env

# 6. Check Login component
grep "google-identity" src/pages/Login.tsx
```

---

## 🎉 Ready!

If you've checked all boxes above, Google Login is ready for testing!

**Next Step:** Start both servers and test the "Continue with Google" button.

```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload

# Terminal 2: Frontend (new terminal)
npm run dev
```

Then open **http://localhost:5173** and click the Google button.

---

**Questions?** See these documents:
- **GOOGLE_AUTH_SETUP.md** — Detailed setup guide
- **ARCHITECTURE.md** — Data flow diagrams
- **IMPLEMENTATION_SUMMARY.md** — Overview of changes
