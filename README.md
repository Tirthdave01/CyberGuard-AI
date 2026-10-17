# CyberGuard AI — Full-Stack Network Intrusion Detection & Threat Prevention System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-00ff88?style=for-the-badge&logo=render&logoColor=white)](https://cyberguard-ai-von0.onrender.com)
[![API Health](https://img.shields.io/badge/API%20Status-Active-00e5ff?style=for-the-badge)](https://cyberguard-ai-von0.onrender.com/api/health)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> 🌐 **Live Application URL:** **[https://cyberguard-ai-von0.onrender.com](https://cyberguard-ai-von0.onrender.com)**  
> 📋 **Live Health Check API:** [https://cyberguard-ai-von0.onrender.com/api/health](https://cyberguard-ai-von0.onrender.com/api/health)

---

## 🛡️ Project Overview
**CyberGuard AI** is a modern full-stack cybersecurity application integrating an **Express.js (Node.js)** RESTful backend with a high-performance **React.js** Single Page Application (SPA). The platform performs real-time traffic monitoring, behavioral anomaly classification using simulated machine learning heuristics (Random Forest, Deep Neural Networks, Support Vector Machines trained on NSL-KDD and CICIDS2017 datasets), full CRUD incident response management, and automated firewall IP blocking.

---

## ⚙️ Architecture & Tech Stack

### Backend (Node.js + Express)
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js REST API
- **Authentication:** JSON Web Tokens (JWT) + BCrypt Password Hashing + Role-Based Access Control (`admin` / `analyst`)
- **Data Persistence:** JSON File Database with atomic read/write service (conforming to project Data Dictionaries)
- **Custom Middleware Pipeline:**
  - `requestLogger`: Logs timestamp, HTTP method, URL, status code, and latency
  - `validateRegistration`, `validateLogin`, `validateTrafficPacket`, `validateAlert`: Strict input validation
  - `verifyToken` & `requireRole`: JWT verification and RBAC protection
  - `notFoundHandler` & `globalErrorHandler`: Centralized error catching and JSON formatting
- **AI Intrusion Engine:** Heuristic and anomaly scoring engine matching NSL-KDD & CICIDS2017 features (DDoS, Brute Force, Port Scan, Web Exploit, Botnet)

### Frontend (React.js SPA)
- **Build Tool:** Vite + React 18
- **State Management:** Functional components, React Hooks (`useState`, `useEffect`, `useContext`)
- **Routing & SPA Layout:** Tab-based SOC dashboard with active status monitoring
- **Styling:** Cyberpunk Dark Theme matching Figures 10 & 11 from the project report
- **Icons:** Lucide React icons
- **Telemetry Visuals:** Real-time threat category distribution bars, incident severity triage matrix, and telemetry gauges

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Start the Backend API Server
```bash
cd backend
npm install
npm start
```
*The backend will boot up at:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

### 3. Start the Frontend React SPA
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Open your browser at:* `http://localhost:3000`

---

## 🔑 Default Credentials (Seed Data)

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **SOC Administrator** | `admin` | `admin123` | `admin@cyberguard.ai` |
| **Security Analyst** | `analyst` | `analyst123` | `analyst@cyberguard.ai` |

*(You can also register new accounts directly from the UI or use the 1-click Quick Demo buttons in the login modal).*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes (Bearer Token) |
| `GET` | `/api/auth/users` | List all users | Yes (`admin` only) |
| `GET` | `/api/traffic` | Stream captured packets with filters | No |
| `POST` | `/api/traffic` | Ingest packet & trigger AI inspection | Yes |
| `POST` | `/api/traffic/analyze`| Sandbox packet evaluation | No |
| `POST` | `/api/traffic/simulate`| Ingest burst of simulated packets | Yes |
| `DELETE`| `/api/traffic/:id` | Delete packet entry | Yes |
| `GET` | `/api/threats` | List detected threats | No |
| `GET` | `/api/threats/stats` | Aggregated dashboard telemetry | No |
| `GET` | `/api/alerts` | List alerts (filter by status/severity) | No |
| `POST` | `/api/alerts` | Create security alert (CRUD: Create) | Yes |
| `GET` | `/api/alerts/:id` | Retrieve single alert (CRUD: Read) | No |
| `PUT` | `/api/alerts/:id` | Update alert status / notes (CRUD: Update) | Yes |
| `DELETE`| `/api/alerts/:id` | Dismiss / delete alert (CRUD: Delete) | Yes |
| `POST` | `/api/alerts/:id/block-ip` | Defensive firewall block & resolve | Yes |
| `GET` | `/api/logs` | Query security audit trail | No |
| `DELETE`| `/api/logs` | Purge audit logs | Yes (`admin` only) |

---

## 📁 Project Structure

```
cyberguard-ai/
├── package.json              # Root package.json for one-click cloud deployment
├── backend/
│   ├── data/                 # JSON file databases (users, traffic, threats, alerts, logs)
│   ├── middleware/           # auth.js, logger.js, validate.js, errorHandler.js
│   ├── routes/               # authRoutes.js, trafficRoutes.js, threatRoutes.js, alertRoutes.js, logRoutes.js
│   ├── services/             # aiEngine.js, storage.js, seedData.js
│   ├── package.json
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, StatCard, Charts, TrafficMonitor, ThreatAnalyzer, AlertManager, SecurityLogs, LoginModal
│   │   ├── context/          # AuthContext.jsx
│   │   ├── services/         # api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🌐 Free Cloud Deployment Guide (Render)

Deploying CyberGuard AI to **Render** is 100% free and takes 2 minutes:

1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your repository: `Tirthdave01/CyberGuard-AI`.
4. Configure the settings:
   - **Name:** `cyberguard-ai` (or your choice)
   - **Language:** `Node`
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Create Web Service**.
Render will build the React SPA, launch the Express backend, and provide you with a live URL (e.g. `https://cyberguard-ai.onrender.com`)!

