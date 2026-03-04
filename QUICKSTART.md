# 🚀 Quick Start: Google Login for Labfinity

Get Google Login working in 5 minutes.

---

## Step 1: Get Google Client ID (2 min)

1. Go to https://console.cloud.google.com/
2. Create OAuth 2.0 Client ID (Web application)
3. Add these to **Authorized JavaScript origins:**
   - `http://localhost:5173`
   - `http://localhost:3000`
4. Add these to **Authorized Redirect URIs:**
   - `http://localhost:5173`
   - `http://localhost:3000`
5. Copy your Client ID (e.g., `1234567890-abc.apps.googleusercontent.com`)

---

## Step 2: Configure Backend (1 min)

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@neon-host:5432/db?sslmode=require
SECRET_KEY=your-random-secret-key
GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
```

---

## Step 3: Configure Frontend (1 min)

Create `.env` (root directory):

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
```

**⚠️ Important:** Use the **same Client ID** in both files.

---

## Step 4: Run Migration (1 min)

```bash
cd backend
python migrate_users.py
```

---

## Step 5: Start Servers

### Terminal 1 — Backend
```bash
cd backend
uvicorn main:app --reload
```

### Terminal 2 — Frontend
```bash
npm run dev
```

---

## Step 6: Test (1 min)

1. Open http://localhost:5173
2. Click **"Continue with Google"**
3. Select your Google account
4. ✅ You're logged in! 🎉

---

## ✅ Verify It Works

Check these:

- [ ] Login button appears
- [ ] Google popup opens when clicked
- [ ] Redirected to `/home` after selecting account
- [ ] See profile picture (if available)
- [ ] Page refresh keeps you logged in
- [ ] No errors in browser console (F12)

---

## 📚 Detailed Guides

- **[GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)** — Full setup + troubleshooting
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** — Step-by-step verification
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — How it works (diagrams + flows)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** — What changed

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Button doesn't work | Check `VITE_GOOGLE_CLIENT_ID` in `.env` |
| CORS error | Add domain to Google Console **Authorized JavaScript origins** |
| "Invalid token" | Verify Client ID is same in both backends |
| No profile picture | This is normal — depends on Google account settings |
| Button stuck loading | Browser console error? Check F12 for details |

---

## Next: Production Deployment

When ready for production:

1. Add your domain to Google Console
2. Update backend CORS settings
3. Set production env vars
4. Deploy to your server

See **[GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)** section 5 for details.

---

**Ready? Start the servers and test!** 🚀
