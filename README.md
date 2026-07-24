# 🚀 CRUIT — Next-Gen Campus Placement & Recruitment Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Deploys on Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Deploys on Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**CRUIT** is a full-stack, enterprise-ready campus placement management and recruitment automation platform. Designed for higher education institutions, students, and corporate recruiters, CRUIT streamlines the entire campus drive lifecycle — from automated CGPA/branch eligibility screening to online proctored assessments, applicant tracking, and offer release.

---

## 🌟 Key Highlights & Features

### 🎓 **Student Hub**
- **Profile & Credential Vault**: Maintain CGPA, active backlogs, technical skill sets, academic projects, and verification documents.
- **Automated Eligibility Engine**: Instant live feedback on job drives based on minimum CGPA, maximum backlogs, and branch restrictions.
- **Smart Application Tracking**: Real-time status pipeline (`applied` → `shortlisted` → `interviewing` → `offered` → `rejected`).
- **Interactive Resume Editor**: Built-in resume creator with instant PDF rendering and stylesheet export.
- **Online Assessment Portal**: Integrated timed multiple-choice & technical assessment module.
- **Alumni Mentorship & Forum**: Direct access to alumni registry and peer discussion boards.

### 🏢 **Employer / Recruiter Console**
- **Job & Drive Management**: Post full-time, internship, and contract openings with customizable criteria.
- **Candidate Screening & AI Match**: Filter applicant talent pools by match score, branch, and academic criteria.
- **Interview Scheduler**: Schedule technical and HR interview rounds with automated status tracking.
- **Offer Management**: Issue formal placement offers with acceptance workflow.

### 🏛️ **Placement Officer Control Center**
- **Institution Analytics**: High-level placement statistics, company participation metrics, and branch-wise outcome reports.
- **Company Verification**: Vetting and approval flow for recruiter account registrations.
- **Assessment Builder**: Create technical evaluation tests with custom question banks and time limits.
- **Campus Drive Coordination**: Oversee and approve drive schedules across departments.

---

## 🏗️ Architecture & Technology Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                   CRUIT Frontend                        │
   │      React 19 + TypeScript + Vite + Tailwind CSS        │
   │                    (Hosted on Vercel)                   │
   └──────────────────────────┬──────────────────────────────┘
                              │ HTTPS / REST API
                              ▼
   ┌─────────────────────────────────────────────────────────┐
   │                    CRUIT Backend                        │
   │       Node.js + Express 5 + TypeScript + JWT Auth       │
   │                    (Hosted on Render)                   │
   └──────────────────────────┬──────────────────────────────┘
                              │ Mongoose ODM
                              ▼
   ┌─────────────────────────────────────────────────────────┐
   │                   MongoDB Atlas                         │
   │           Cloud NoSQL Database Cluster                  │
   └─────────────────────────────────────────────────────────┘
```

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, Axios, React Router v7 |
| **Backend** | Node.js, Express 5, TypeScript, Mongoose ODM, JWT Auth, Multer, Nodemailer, Cloudinary |
| **Database** | MongoDB Atlas Cluster |
| **Hosting** | **Frontend**: Vercel (`.vercel.app`) \| **Backend**: Render (`.onrender.com`) |

---

## 🛠️ Project Structure

```
POD.AI/
├── render.yaml                   # Render deployment infrastructure blueprint
├── backend/                      # Node.js + Express REST API
│   ├── src/
│   │   ├── config/               # Database connection & env variables loader
│   │   ├── controllers/          # Business logic (auth, student, officer, employer)
│   │   ├── middlewares/          # JWT authentication, RBAC, error handlers
│   │   ├── models/               # Mongoose data schemas (User, Job, Application, Drive)
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Email dispatch (Nodemailer) & Cloudinary storage
│   │   └── app.ts                # Express application entrypoint
│   ├── package.json
│   └── tsconfig.json
└── frontend/                     # React 19 Single Page Application
    ├── vercel.json               # SPA rewrite rules for client-side routing
    ├── vite.config.ts            # Vite build configuration
    ├── src/
    │   ├── components/           # Reusable UI components & branding Logo
    │   ├── context/              # Global state (AuthContext, ThemeContext)
    │   ├── pages/                # Route views (Landing, Student, Officer, Recruiter)
    │   ├── config/               # Axios instance configuration
    │   └── main.tsx              # React DOM render root
    └── package.json
```

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cruit
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
CLIENT_URL=https://your-frontend.vercel.app

# SMTP Mail Settings (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=no-reply@cruit.ai

# Cloud Storage Settings (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://cruit-backend.onrender.com/api/v1
```

---

## 🚀 Local Development Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas account)

### 1. Clone the Repository
```bash
git clone https://github.com/Pieenear/POD.AI.git
cd POD.AI
```

### 2. Configure Backend
```bash
cd backend
npm install
npm run dev
```
*Backend server will start on `http://localhost:5000`*

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend dev server will start on `http://localhost:5173`*

---

## 🌐 Production Deployment

### 1. Backend (Render.com)
1. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint** or **Web Service**.
2. Connect repository `Pieenear/POD.AI`.
3. Set **Root Directory** to `backend`.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add mandatory environment variables (`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`).

### 2. Frontend (Vercel.com)
1. Log in to [Vercel Dashboard](https://vercel.com/) and click **Add New...** → **Project**.
2. Import repository `Pieenear/POD.AI`.
3. Framework Preset: **Vite**.
4. Root Directory: **`frontend`**.
5. Environment Variable: Set `VITE_API_URL` to `https://<your-render-backend>.onrender.com/api/v1`.
6. Click **Deploy**.

---

## 📡 Core API Routes Summary

| Endpoint | Method | Role Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Public | Register new user account |
| `/api/v1/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/api/v1/student/profile` | `GET` / `PUT` | Student | Fetch or update student profile |
| `/api/v1/student/jobs` | `GET` | Student | List active job postings with eligibility |
| `/api/v1/student/applications` | `POST` | Student | Apply for campus recruitment drive |
| `/api/v1/employer/jobs` | `POST` / `GET` | Employer | Create or manage company job openings |
| `/api/v1/employer/applications` | `GET` | Employer | Review candidate talent pool |
| `/api/v1/officer/drives` | `GET` / `POST` | Officer | Oversee placement drives across campus |
| `/api/v1/officer/verify-company`| `PATCH` | Officer | Verify employer registration request |

---

## 📜 License & Copyright

© 2026 **CRUIT**. All Rights Reserved. Built with ❤️ for educational institutions & talent recruitment.
