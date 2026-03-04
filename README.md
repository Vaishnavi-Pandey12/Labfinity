# 🔬 Labfinity — Virtual Science Lab

**Labfinity** is an interactive virtual laboratory platform built for **VIT-AP University** students. It provides immersive, browser-based simulations for Chemistry and Physics experiments, complete with animated apparatuses, real-time calculations, and observation tables.

---

## ✨ Features

- 🧪 **Interactive Simulators** — Animated, realistic lab setups for each experiment
- 📊 **Dynamic Observation Tables** — Auto-generated tables using real scientific equations (Nernst, Beer-Lambert, etc.)
- 🖼️ **Graph Upload** — Students can capture and upload graphs directly from the simulator
- 🔐 **Optional Login** — Accessible to all; login available for future personalization
- 📱 **Responsive Design** — Works seamlessly on desktop and mobile

---

## 🧬 Experiments

### Chemistry
| # | Experiment | Key Concepts |
|---|-----------|-------------|
| 1 | **Electrochemistry — Daniell Cell** | Nernst Equation, EMF, Electrode selection (Zn, Cu, Ag, Ni) |
| 2 | **Potentiometric Titration** | pH vs Volume curve, Equivalence Point |
| 3 | **Colorimetry (Beer-Lambert Law)** | Absorbance, λmax, Concentration |
| 4 | **UV-Vis Spectroscopy** | Wavelength scan, Molar absorptivity |

### Physics
| # | Experiment | Key Concepts |
|---|-----------|-------------|
| 1 | **Projectile Motion** | Trajectory, Range, Time of Flight |
| 2 | **Optics — Refraction** | Snell's Law, Refractive Index |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| shadcn/ui + Radix UI | Component library |
| Framer Motion | Animations |
| Recharts | Graphs & charts |
| React Router DOM | Routing |
| React Hook Form + Zod | Form validation |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | REST API |
| Uvicorn | ASGI server |
| Pydantic | Data validation |
| Python `math` | Scientific calculations |
| python-dotenv | Environment config |
| python-multipart | File uploads |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **pip**

---

### 1. Clone the Repository

```bash
git clone https://github.com/Vaishnavi-Pandey12/Labfinity.git
cd Labfinity
```

---

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at → **http://localhost:5173**

---

### 3. Backend Setup

```bash
cd backend

# (Recommended) Create a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload 
```

Backend API runs at → **http://localhost:8000**

> 💡 API docs available at **http://localhost:8000/docs** (Swagger UI)

### Google authentication

The backend exposes a POST `/auth/google` endpoint that expects a JSON body
`{ "token": "<google-id-token>" }`.  The ID token **must** be obtained using
the official Google Identity Services SDK in the frontend; never trust the email
address supplied by the client without verifying the token.  On the server the
`google-auth` package verifies the token, extracts `sub`, `email`, `name`, and
`picture`, and either creates a new user or links an existing account.  A JWT
(access token) is returned just like the normal `/api/signin` route.
---

### 4. Environment Variables

Create a `.env` file in the `backend/` directory and, if using Google login, add your OAuth
client ID obtained from the Google Cloud console:

```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=some_random_secret
GOOGLE_CLIENT_ID=12345-your-google-client-id.apps.googleusercontent.com
```

The frontend also needs access to the Google client ID.  Add the corresponding Vite
variable to the root `.env` (next to `package.json`):

```env
VITE_API_URL=http://localhost:8000          # already used elsewhere
VITE_GOOGLE_CLIENT_ID=12345-your-google-client-id.apps.googleusercontent.com
```

(Any variable prefixed with `VITE_` will be exposed to the browser by Vite.)

Once these values are populated you can use the **Continue with Google** button on the
login screen to authenticate.

---

## 📁 Project Structure

```
Labfinity/
├── src/
│   ├── pages/               # Route-level pages (Home, Experiments, Login...)
│   ├── components/
│   │   ├── experiment/      # Simulators & theory components
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   └── App.tsx              # Root component & routing
│
├── backend/
│   ├── main.py              # FastAPI entry point & API routes
│   ├── chem_tables.py       # Scientific table generators
│   ├── requirements.txt     # Python dependencies
│   └── uploads/             # Uploaded student graphs
│
├── public/                  # Static assets
├── package.json             # Node dependencies
└── vite.config.ts           # Vite configuration
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/signup` | Register a new user (Neon/Postgres)
| `POST` | `/api/signin` | Obtain JWT access token
| `GET` | `/api/me` | Fetch current user info (requires Bearer token)
| `POST` | `/api/electrochemistry-table` | Generate Daniell Cell observation table |
| `POST` | `/api/upload` | Upload student graph image |

---

## 🛠️ Available Scripts

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Backend
```bash
# install Python dependencies first (example using a virtualenv)
# cd into the backend folder before installing if you like
pip install -r backend/requirements.txt

# environment variables needed by the backend
# - DATABASE_URL : PostgreSQL connection URL (typically a Neon-managed database).  e.g. `postgresql://user:pass@host:port/dbname`
# - SECRET_KEY    : random string used to sign JWT tokens
# - GOOGLE_CLIENT_ID : OAuth 2.0 client ID from Google (optional, required for Google login)
#
# The application no longer uses SQLite or Supabase; all user data is stored in PostgreSQL.


# two equivalent ways to start the API:

# 1. run from the backend directory (matches the examples in earlier
# documentation)
cd backend
uvicorn main:app --reload          # Dev server with hot-reload
uvicorn main:app --port 8000       # Production-like start

# 2. run from the workspace root using the package name.  this mode is
# required if you want to keep your frontend and backend in the same
# process or using a single Docker container.
uvicorn backend.main:app --reload
uvicorn backend.main:app --port 8000
```

---

## 🧪 Running Backend Tests

```bash
# make sure dependencies are installed (see "Available Scripts" above)
# you don't need a database URL to run the pure-Python table tests
cd backend
python chem_tables.py   # Run built-in table generation tests
```

---

## 📸 Screenshots

> _Add screenshots of your simulators here_

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-experiment`
3. Commit your changes: `git commit -m "Add new experiment"`
4. Push and open a Pull Request

---

## 📄 License

This project is developed for **VIT-AP University** academic use.

---

<p align="center">
  Built with ❤️ for science education at <strong>VIT-AP University</strong>
</p>
