# Google Authentication Setup Guide for Labfinity

This guide walks you through setting up Google Login using Google Identity Services SDK.

## 1. Backend Configuration

### ✅ What's Already Done

The backend is configured to:
- Verify Google ID tokens using the `google-auth` library
- Extract `sub`, `email`, `name`, and `picture` from tokens
- Create new users or link existing accounts to Google
- Return a JWT access token on successful login

**Backend Endpoint:** `POST /auth/google`
- **Input:** `{ "token": "<google-id-token>" }`
- **Output:** `{ "access_token", "user_id", "email", "username", "profile_picture", ... }`

### ⚙️ Backend Environment Variables

Set these in `backend/.env`:

```env
# Database (Neon PostgreSQL with SSL)
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require

# JWT secret for token signing
SECRET_KEY=your-random-secret-key-here

# Google OAuth 2.0 Client ID (get from Google Cloud Console)
GOOGLE_CLIENT_ID=1234567890-abcd1234.apps.googleusercontent.com
```

### Database Schema

The `users` table now supports:
- **hashed_password** (nullable) — NULL for Google-only accounts
- **google_id** (unique, nullable) — Google's `sub` claim
- **profile_picture** (nullable) — Google profile photo URL

No migration needed if starting fresh; existing databases should run:
```bash
cd backend
python migrate_users.py
```

---

## 2. Frontend Configuration

### ✅ What's Already Done

The frontend now:
- Loads Google Identity Services SDK dynamically at runtime
- Initializes the SDK with your Google Client ID
- Handles the credential callback from Google
- Sends the ID token to `/auth/google` via `useAuth().googleLogin()`
- Stores the JWT in localStorage

**Login Component:** `src/pages/Login.tsx`
- Includes Google SDK loading and initialization
- "Continue with Google" button triggers `window.google.accounts.id.prompt()`

### ⚙️ Frontend Environment Variables

Set these in the root `.env` (next to `package.json`):

```env
# Vite will inject these into the browser as `import.meta.env.*`
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=1234567890-abcd1234.apps.googleusercontent.com
```

---

## 3. Google Cloud Console Setup

### Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or use OAuth 2.0)
4. Go to **Credentials** → **Create OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add these **Authorized redirect URIs:**
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (if you use React dev server)
   - Your production domain (e.g., `https://labfinity.example.com`)

7. Copy the **Client ID** (looks like: `12345-abcd.apps.googleusercontent.com`)

### Configure Authorized JavaScript Origins

In the same OAuth 2.0 Client settings, add these **Authorized JavaScript origins:**
- `http://localhost:5173`
- `http://localhost:3000`
- Your production domain

This prevents CORS errors when the Google SDK loads.

---

## 4. Testing the Flow

### Prerequisites
- Backend running: `uvicorn backend.main:app --reload` (on http://localhost:8000)
- Frontend running: `npm run dev` (on http://localhost:5173)
- `.env` files in both directories with correct values

### Step-by-Step Test

1. **Open Login Page**
   - Navigate to http://localhost:5173
   - You should see the login form with a "Continue with Google" button

2. **Click "Continue with Google"**
   - Google's account chooser popup appears
   - Select your Google account

3. **Verify Backend Receives Token**
   - Backend logs show POST to `/auth/google`
   - Token is verified; user is created or logged in

4. **Check Response**
   - You're redirected to `/home`
   - JWT is stored in localStorage under `labfinity_token`
   - Profile picture appears (if available)

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Google SDK not loaded yet" | Wait a moment; SDK takes ~1s to load. Check browser console for errors. |
| CORS error loading SDK | Check that your frontend domain is in **Authorized JavaScript Origins** on Google Console. |
| "Invalid Google token" | Verify `GOOGLE_CLIENT_ID` in both backend and frontend `.env` files match exact value from Google Console. |
| User created but no profile picture | Google may not have returned a `picture` claim. This is optional and depends on user's Google account settings. |
| "hashed_password NOT NULL" error | Run migration: `python backend/migrate_users.py` to make the column nullable. |

---

## 5. Production Deployment

### Backend
1. Set `GOOGLE_CLIENT_ID` in production environment
2. Use a strong `SECRET_KEY` (not the dev one)
3. Update `DATABASE_URL` to your Neon PostgreSQL production database
4. Ensure `sslmode=require` for secure database connections

### Frontend
1. Build the project: `npm run build`
2. Set `VITE_GOOGLE_CLIENT_ID` in your hosting environment
3. Add your production domain to **Authorized Redirect URIs** and **Authorized JavaScript Origins** in Google Console
4. Update `VITE_API_URL` to point to your production backend

### CORS Settings
Update `backend/main.py` to allow your production domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # dev
        "https://labfinity.example.com",  # production
    ],
    ...
)
```

---

## 6. Security Checklist

- ✅ Backend **always verifies** ID tokens — never trust frontend claims
- ✅ `hashed_password` is nullable for Google-only users
- ✅ `google_id` is unique to prevent account confusion
- ✅ Database uses `sslmode=require` for Neon
- ✅ Frontend sends token over HTTPS in production
- ✅ JWT expires after 60 minutes (configurable)
- ✅ Sensitive environment variables are **not committed** to git

---

## 7. Common Tasks

### Add a Link Google Account Feature
Modify `/api/signin` to also update `google_id` if linking is intended:
```python
user.google_id = google_id
db.commit()
```

### Change JWT Expiration
Edit `backend/main.py`:
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 120  # 2 hours instead of 1
```

### Disable Google Login Temporarily
Set `GOOGLE_CLIENT_ID` to an empty string or remove it from `.env`.
The frontend will show "Google SDK not loaded" until it's reset.

---

## 8. References

- [Google Identity Services Docs](https://developers.google.com/identity/gsi/web)
- [google-auth PyPI](https://github.com/googleapis/google-auth-library-python)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Neon PostgreSQL Docs](https://neon.tech/docs)

---

**Questions?** Check the browser console (F12) and backend logs (`uvicorn` output) for detailed error messages.
