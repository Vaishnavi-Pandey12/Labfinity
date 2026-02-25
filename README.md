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
uvicorn main:app --reload --port 8000
```

Backend API runs at → **http://localhost:8000**

> 💡 API docs available at **http://localhost:8000/docs** (Swagger UI)

---

### 4. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Add any API keys or config here
```

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
uvicorn main:app --reload          # Dev server with hot-reload
uvicorn main:app --port 8000       # Production-like start
```

---

## 🧪 Running Backend Tests

```bash
cd backend
python chem_tables.py   # Run all built-in table generation tests
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
