# 🚀 SkillPath — Cognitive Personal Skill Tracking & AI Mentor

<div align="center">
  <p align="center">
    <strong>A next-generation, gamified learning analytics suite and interactive cognitive mentor designed for developers and lifelong learners.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Zustand-5.0-orange?style=for-the-badge" alt="Zustand" />
    <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-BF40BF?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini 2.5 Flash" />
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/Framer_Motion-12.0-F107A3?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Recharts-3.8-22B573?style=flat-square" alt="Recharts" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  </p>
</div>

---

## 🌟 Overview

**SkillPath** is a state-of-the-art personal growth dashboard that transforms the process of learning new skills into a structured, highly visual, and gamified RPG-like experience. At its core is an **AI-powered Cognitive Mentor** that analyzes your real-time performance log, tracking history, and daily reflections to deliver customized advice, step-by-step roadmaps, and detailed weekly study schedules.

Crafted with a stunning **dark-mode glassmorphic user interface**, SkillPath pairs aesthetic excellence with offline resilience to create a learning hub you'll love returning to every single day.

---

## ✨ Key Features

### 🧠 Google Gemini AI Learning Coach
Powered by **Gemini 2.5 Flash**, the built-in AI Coach functions as a personalized learning psychologist and mentor:
* **Context-Aware Analytics**: The AI Coach automatically reviews your active skills, logged session durations, and recent mood reflections to generate contextual guidance.
* **Weekly Performance Audits**: Click to compile a highly structured, emoji-rich learning audit reviewing your progress and identifying behavioral blockages.
* **Custom Habit & Schedule Creation**: Ask for customized, bite-sized daily studies or target roadmaps designed to help you balance your routine.

### 📊 Rich Visual Progress Dashboard
No more guessing your growth vectors. SkillPath leverages **Recharts** to deliver interactive data visualizations:
* **Skill Balance Radar Chart**: Discover where your technical profile is strongest and where it needs development.
* **Productivity Tracker**: Visual charts tracking your session durations and daily XP metrics over time.
* **Confidence Curves**: Keep a visual gauge on your current self-assessed competence across all learning dimensions.

### 🏆 Gamified Progression & Achievements
Keep your learning momentum high with built-in reward mechanics:
* **Experience Points (XP) & Levels**: Gain XP for every study session logged and watch your profile level up.
* **Streak Tracking**: Maintain a consecutive daily learning streak and unlock special bragging rights.
* **Milestone Achievements**: Unlock beautifully styled badges (e.g., *Consistency Master*, *Deep Focus*, *Polymath*) as your skills evolve.

### 📓 Cognitive Mindset & Reflection Journal
Link emotional intelligence to intellectual growth:
* **Reflection Logging**: Record thoughts, milestones, and learning blocks after study sessions.
* **Mindset & Mood Tracker**: Log your mood and mindset level (e.g., Happy, Focused, Fatigued, Anxious) to see how emotional well-being relates directly to your productivity.

### 💼 Portfolio Certificate Vault
Keep all your qualifications, course certificates, and learning credentials stored securely:
* Organize by category, issue date, credential ID, and custom tags.
* Showcase a visual feed of all completed courses and achievements.

### ⚡ Offline-First Resilience
* Built on **Zustand** state-management with automated **LocalStorage synchronization** fallback.
* Fully decoupled, enabling a seamless transition to enterprise cloud backends (e.g., Supabase or Firebase) using preconfigured drivers.

---

## 📂 Architecture & Directory Structure

SkillPath is designed as a decoupled workspace, separation-of-concerns ready for full cloud scalability:

```
SkillPath/
├── backend/                   # 🖥️ Node.js + Express API Server
│   ├── src/
│   │   └── server.ts          # Express API definitions & health checkers
│   ├── .env                   # Local server configurations
│   ├── package.json           # Server package requirements
│   └── vercel.json            # Vercel Serverless function configurations
│
└── frontend/                  # 🎨 Vite + React 19 Client SPA
    ├── public/                # Static assets & web banners
    ├── src/
    │   ├── assets/            # Media assets & fallback graphics
    │   ├── components/        # Shared components (Layout, ParticleBackgrounds, Onboarding Modals)
    │   ├── lib/               # System styling & Tailwind utilities (cn classes)
    │   ├── pages/             # App views (Dashboard, AI Coach, Skills, Journal, Certificates, Growth)
    │   ├── store/             # Zustand state manager (useStore.ts)
    │   ├── App.tsx            # Main App shell, navigation router, and routes
    │   └── index.css          # Tailored style system, HSL color tokens, animations
    │
    ├── tailwind.config.js     # Glassmorphic layout directives & presets
    ├── tsconfig.json          # Strict type-checking rules
    ├── package.json           # Frontend packages (React 19, Lucide, Recharts, Framer Motion)
    └── vercel.json            # Client SPA single-page routing policies
```

---

## 🚀 Setup & Installation

Get your local copy of SkillPath up and running in a few simple steps.

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)

### 📦 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/SkillPath.git
cd SkillPath
```

#### Set up the backend:
```bash
cd backend
npm install
```

#### Set up the frontend:
```bash
cd ../frontend
npm install
```

### ⚙️ 2. Environment Configuration

To enable the **AI Learning Coach**, get a free Google Gemini API Key from the [Google AI Studio](https://aistudio.google.com/).

The frontend includes a highly resilient client-side API driver configured to run right out of the box. Optionally, configure environment variables:

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
```

---

## 💻 Running the Application

For the best experience, run both the backend server and frontend client concurrently:

### Run the Express Backend Server
```bash
cd backend
npm run dev
```
*The server will boot up at `http://localhost:5000`*

### Run the React Frontend Client
```bash
cd frontend
npm run dev
```
*The dev server will boot up at `http://localhost:5173`*

Open `http://localhost:5173` in your browser and start tracking your path!

---

## ☁️ Deployment Guides

### 1. Frontend Deployment (Vercel)
Vercel supports Vite SPAs natively. Here is how to configure it:

1. Import your GitHub repository into Vercel.
2. Select **Framework Preset** as **Vite**.
3. Set the **Root Directory** to `frontend`.
4. Leave build settings as default (`npm run build`, `dist`).
5. Set environment variables if needed and click **Deploy**.

### 2. Backend Serverless Deployment (Vercel)
Deploy your Node.js + Express API to Vercel using serverless functions:

1. The included `backend/vercel.json` already contains the deployment layout:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.ts"
       }
     ]
   }
   ```
2. Import your repository to Vercel, setting **Root Directory** to `backend`.
3. Vercel will handle compilation of typescript server files into Serverless functions instantly.

*Alternatively, deploy the backend process to **Render**, **Railway**, or **Fly.io** for live running Express processes.*

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ for developers who love to build, learn, and grow.
