# Google Authentication Architecture

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  BROWSER (React Frontend)                                            │
│  ───────────────────────────                                         │
│                                                                      │
│  1. User clicks "Continue with Google" button                        │
│     └─> [Login.tsx] triggers window.google.accounts.id.prompt()    │
│                                                                      │
│  2. Google Identity Services SDK (loaded from CDN)                  │
│     └─> Shows account chooser popup                                 │
│     └─> User selects account                                        │
│                                                                      │
│  3. Google callback returns credential (ID token)                   │
│     └─> handleGoogleCredential(response)                            │
│     └─> calls googleLogin(response.credential)                      │
│                                                                      │
│  4. useAuth hook sends token to backend                             │
│     ┌────────────────────────────────────────────┐                  │
│     │  POST /auth/google                         │                  │
│     │  Content-Type: application/json            │                  │
│     │  { "token": "<google-id-token>" }          │                  │
│     └────────────────────────────────────────────┘                  │
│                    │                                                 │
│                    │ HTTPS (secure)                                 │
│                    ▼                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  BACKEND (FastAPI)                                           │  │
│  │  ─────────────────                                           │  │
│  │                                                               │  │
│  │  5. Receive POST /auth/google with ID token                  │  │
│  │     └─> google_login() handler                               │  │
│  │                                                               │  │
│  │  6. VERIFY token using google-auth library                   │  │
│  │     └─> id_token.verify_oauth2_token()                       │  │
│  │     └─> Checks signature against Google's public keys        │  │
│  │     └─> Extracts claims: sub, email, name, picture           │  │
│  │                                                               │  │
│  │  7. Query database: does google_id exist?                    │  │
│  │     ┌─────────────────────────────────────┐                  │  │
│  │     │ PostgreSQL (Neon)                   │                  │  │
│  │     │ ─────────────────                   │                  │  │
│  │     │ SELECT * FROM users                 │                  │  │
│  │     │ WHERE google_id = ?                 │                  │  │
│  │     │ OR email = ?                        │                  │  │
│  │     │                                     │                  │  │
│  │     │ Columns:                            │                  │  │
│  │     │ - id (primary)                      │                  │  │
│  │     │ - email (unique)                    │                  │  │
│  │     │ - google_id (unique, nullable)      │                  │  │
│  │     │ - hashed_password (nullable)        │                  │  │
│  │     │ - profile_picture (nullable)        │                  │  │
│  │     │ - username                          │                  │  │
│  │     │                                     │                  │  │
│  │     └─────────────────────────────────────┘                  │  │
│  │                                                               │  │
│  │  8. User logic:                                              │  │
│  │     if google_id found:                                      │  │
│  │        └─> Login existing user                              │  │
│  │     else if email found:                                    │  │
│  │        └─> Link Google to existing account                  │  │
│  │     else:                                                   │  │
│  │        └─> Create new user (username from email)            │  │
│  │        └─> Set hashed_password = NULL                       │  │
│  │        └─> Set profile_picture from Google                  │  │
│  │                                                               │  │
│  │  9. Create JWT access token                                  │  │
│  │     └─> payload: { user_id, email, exp }                    │  │
│  │     └─> signed with SECRET_KEY                              │  │
│  │                                                               │  │
│  │  10. Return response                                         │  │
│  │      ┌──────────────────────────────────────┐               │  │
│  │      │ HTTP 200 OK                          │               │  │
│  │      │ {                                    │               │  │
│  │      │   \"access_token\": \"eyJ...\",   │               │  │
│  │      │   \"user_id\": 42,                 │               │  │
│  │      │   \"email\": \"user@example.com\",│               │  │
│  │      │   \"username\": \"user\",          │               │  │
│  │      │   \"profile_picture\": \"https://..\"│               │  │
│  │      │ }                                    │               │  │
│  │      └──────────────────────────────────────┘               │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                    │                                                 │
│                    │ HTTPS                                          │
│                    ▼                                                 │
│  11. Frontend receives JWT                                          │
│      └─> localStorage.setItem(\"labfinity_token\", jwt)          │
│      └─> Set user context { user_id, email, username, ... }       │
│      └─> Redirect to /home                                         │
│                                                                      │
│  12. Subsequent requests include JWT                                │
│      ┌──────────────────────────────────────────┐                  │
│      │ GET /api/me                              │                  │
│      │ Authorization: Bearer eyJ...             │                  │
│      └──────────────────────────────────────────┘                  │
│      └─> Backend verifies JWT signature                            │
│      └─> Returns current user info                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│ Frontend                                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  src/pages/Login.tsx                                                │
│  │                                                                   │
│  ├─> useAuth() hook                                                │
│  │   └─> context: { googleLogin(token) }                           │
│  │                                                                   │
│  ├─> Google SDK Script Loader (useEffect)                          │
│  │   └─> Loads https://accounts.google.com/gsi/client              │
│  │   └─> Initializes window.google.accounts.id                     │
│  │   └─> Sets callback: handleGoogleCredential                     │
│  │                                                                   │
│  └─> "Continue with Google" Button                                 │
│      └─> onClick: window.google.accounts.id.prompt()               │
│      └─> Opens Google account chooser popup                        │
│      └─> Returns credential via callback → handleGoogleCredential  │
│                                                                      │
│  src/hooks/useAuth.tsx                                              │
│  │                                                                   │
│  ├─> Context: AuthContext                                          │
│  │   └─> user, token, loading state                                │
│  │                                                                   │
│  └─> googleLogin(token): Promise<void>                             │
│      └─> POST /auth/google { token }                               │
│      └─> Receives: access_token, user_id, email, profile_picture   │
│      └─> Saves to localStorage & context                           │
│                                                                      │
│  src/types/google-identity.d.ts                                    │
│  └─> TypeScript type definitions for window.google                 │
│                                                                      │
│  .env (root)                                                        │
│  └─> VITE_GOOGLE_CLIENT_ID (exposed to browser)                    │
│  └─> VITE_API_URL                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

                            ↕ HTTP/HTTPS

┌─────────────────────────────────────────────────────────────────────┐
│ Backend                                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  backend/main.py                                                    │
│  │                                                                   │
│  └─> @app.post(\"/auth/google\")                                    │
│      │                                                               │
│      ├─> Receive GoogleLoginRequest { token }                       │
│      │                                                               │
│      ├─> VERIFY token using google-auth                            │
│      │   └─> from google.oauth2 import id_token                    │
│      │   └─> id_token.verify_oauth2_token(token, ...)              │
│      │   └─> Raises exception if invalid                           │
│      │                                                               │
│      ├─> Extract claims: sub, email, name, picture                  │
│      │                                                               │
│      ├─> Query database (db.Session depends on get_db)             │
│      │   └─> User.google_id == sub ? (existing user)               │
│      │   └─> User.email == email ? (link account)                  │
│      │   └─> Neither? Create new user                              │
│      │                                                               │
│      ├─> Create JWT (create_access_token)                          │
│      │   └─> import jwt, datetime, timedelta                        │
│      │   └─> Signed with SECRET_KEY                                │
│      │   └─> Expires in 60 minutes                                  │
│      │                                                               │
│      └─> Return response {access_token, user_id, email, ...}       │
│                                                                      │
│  backend/models.py                                                  │
│  │                                                                   │
│  └─> class User(Base)                                              │
│      └─> id: primary key                                           │
│      └─> email: unique                                             │
│      └─> username: unique                                          │
│      └─> hashed_password: nullable (for Google users)              │
│      └─> google_id: unique, nullable                               │
│      └─> profile_picture: nullable                                 │
│                                                                      │
│  backend/db.py                                                      │
│  │                                                                   │
│  ├─> DATABASE_URL from .env                                        │
│  │   └─> postgresql://...?sslmode=require                          │
│  │                                                                   │
│  ├─> engine = create_engine(DATABASE_URL, ...)                     │
│  │   └─> connect_args={\"sslmode\": \"require\"}                  │
│  │                                                                   │
│  └─> SessionLocal, get_db dependency                               │
│                                                                      │
│  backend/.env                                                       │
│  ├─> DATABASE_URL                                                  │
│  ├─> SECRET_KEY                                                    │
│  └─> GOOGLE_CLIENT_ID                                              │
│                                                                      │
│  backend/requirements.txt                                           │
│  ├─> fastapi, uvicorn                                              │
│  ├─> sqlalchemy, psycopg2                                          │
│  ├─> PyJWT, bcrypt                                                 │
│  └─> google-auth (for token verification)                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

                         ↕ SQL over SSL

┌─────────────────────────────────────────────────────────────────────┐
│ Database (Neon PostgreSQL)                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TABLE: users                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ id (integer, PK)            | 1, 2, 3, ...                 │   │
│  │ email (varchar, UNIQUE)     | user@example.com             │   │
│  │ username (varchar, UNIQUE)  | john_doe                     │   │
│  │ hashed_password (varchar)   | NULL (for Google users)      │   │
│  │ google_id (varchar, UNIQUE) | 1234567890... (from sub)    │   │
│  │ profile_picture (varchar)   | https://lh3... (Google URL)│   │
│  │ created_at (timestamp)      | 2024-03-04 12:34:56         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Connection:  sslmode=require (Neon requirement)                   │
│  Pool:        SQLAlchemy connection pool                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────────────────────────────┐
│                         SECURITY CHECKLIST                             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ✅ Token Verification                                                 │
│     └─> Backend ALWAYS verifies Google ID tokens                       │
│     └─> Never trusts frontend email/claims directly                    │
│     └─> Uses google-auth library (validates signature)                 │
│                                                                         │
│  ✅ Database Encryption                                                │
│     └─> Neon PostgreSQL requires sslmode=require                       │
│     └─> All queries encrypted over SSL/TLS                             │
│                                                                         │
│  ✅ Password Handling                                                  │
│     └─> Google-only users have NULL hashed_password                    │
│     └─> No password needed for Google login                            │
│     └─> Existing email+password accounts unaffected                    │
│                                                                         │
│  ✅ Account Uniqueness                                                 │
│     └─> google_id UNIQUE constraint                                    │
│     └─> email UNIQUE constraint                                        │
│     └─> Prevents duplicate accounts or hijacking                       │
│                                                                         │
│  ✅ JWT Signing                                                        │
│     └─> Signed with SECRET_KEY (never expose this!)                    │
│     └─> Expires after 60 minutes (configurable)                        │
│     └─> HS256 algorithm                                                │
│                                                                         │
│  ✅ Environment Variables                                              │
│     └─> .env file NOT committed to git                                 │
│     └─> GOOGLE_CLIENT_ID safe (frontend only)                          │
│     └─> SECRET_KEY, DATABASE_URL kept secret                           │
│                                                                         │
│  ✅ CORS Protection                                                    │
│     └─> Backend allows only whitelisted origins                        │
│     └─> Google SDK requires Authorized JavaScript origins              │
│                                                                         │
│  ✅ Google OAuth Security                                              │
│     └─> Client ID validates request source                             │
│     └─> Token signature verified against Google's keys                 │
│     └─> Never exposed to backend until verified                        │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example

**Scenario: New user logs in with Google**

```
User clicks "Continue with Google"
    │
    ├─> Google SDK loaded from CDN
    ├─> Account chooser popup opens
    │   User: "dan@gmail.com"
    │   Google Account: "google_sub_123456"
    │
    ├─> Credential returned: { credential: "eyJhbGciOi..." }
    │
    ├─> Frontend calls googleLogin("eyJhbGciOi...")
    │
    ├─> POST http://localhost:8000/auth/google
    │   { "token": "eyJhbGciOi..." }
    │
    ├─> Backend receives request
    │   ├─> Verify token signature
    │   ├─> Extract claims:
    │   │   - sub: "google_sub_123456"
    │   │   - email: "dan@gmail.com"
    │   │   - name: "Dan Smith"
    │   │   - picture: "https://lh3.google..."
    │   │
    │   ├─> Query: SELECT * FROM users WHERE google_id = "google_sub_123456"
    │   │   Result: NULL (new user)
    │   │
    │   ├─> Query: SELECT * FROM users WHERE email = "dan@gmail.com"
    │   │   Result: NULL (no existing account)
    │   │
    │   ├─> CREATE USER:
    │   │   {
    │   │     username: "dan",
    │   │     email: "dan@gmail.com",
    │   │     hashed_password: NULL,
    │   │     google_id: "google_sub_123456",
    │   │     profile_picture: "https://lh3.google...",
    │   │     created_at: now()
    │   │   }
    │   │
    │   ├─> INSERT INTO users VALUES (...)
    │   │
    │   ├─> Create JWT:
    │   │   {
    │   │     user_id: 42,
    │   │     email: "dan@gmail.com",
    │   │     exp: <60 min from now>
    │   │   }
    │   │ Signed with SECRET_KEY
    │   │
    │   └─> Response:
    │       {
    │         "access_token": "eyJ0eXAiOi...",
    │         "user_id": 42,
    │         "email": "dan@gmail.com",
    │         "username": "dan",
    │         "profile_picture": "https://lh3.google..."
    │       }
    │
    ├─> Frontend receives response
    ├─> localStorage.setItem("labfinity_token", "eyJ0eXAiOi...")
    ├─> Set user context
    │
    └─> navigate("/home")
        User is now authenticated!
        
        Next requests:
        GET /api/me
        Authorization: Bearer eyJ0eXAiOi...
        └─> Backend verifies JWT → returns user info
```

---

## Environment Variables Reference

| Variable | Location | Purpose | Example |
|----------|----------|---------|---------|
| VITE_API_URL | `.env` (root) | Frontend → Backend URL | `http://localhost:8000` |
| VITE_GOOGLE_CLIENT_ID | `.env` (root) | Google Client ID (frontend) | `1234-abcd.apps.googleusercontent.com` |
| DATABASE_URL | `backend/.env` | PostgreSQL/Neon connection | `postgresql://...?sslmode=require` |
| SECRET_KEY | `backend/.env` | JWT signing secret | `your-random-secret` |
| GOOGLE_CLIENT_ID | `backend/.env` | Google Client ID (backend verify) | `1234-abcd.apps.googleusercontent.com` |

---

See **[GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)** for step-by-step configuration instructions.
