# 📘 AI Fitness & Habit Coach

## 🧠 Introduction

This project is a **web-based AI Fitness & Habit Coach** that allows users to:

* **Sign up and log in**
* Log daily fitness activities (workouts, mood, weight, etc.)
* Store personalized profiles
* Analyze progress using AI logic
* Generate adaptive fitness schedules based on user logs
* Store and display user-specific plans and insights

The backend is built using **FastAPI + MongoDB + JWT authentication**.
The frontend is built using **Next.js (App Router) with TypeScript**.

---

## 🧪 Prerequisites

Make sure you have:

* Python 3.9+
* Node.js 16+
* MongoDB Atlas or local MongoDB instance
* Git (optional but recommended)

---

## 🚀 Backend Setup (FastAPI)

1. **Navigate to backend folder**

```bash
cd backend
```

2. **Create and activate virtual environment (optional)**

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

3. **Install dependencies**

```bash
pip install -r requirements.txt
```

4. **Create `.env` file**

Inside `backend`, create a file named `.env`:

```bash
MONGO_URI=<Your MongoDB Connection URI>
JWT_SECRET=<Your JWT secret string>
LLM_API_KEY=<Your Mistral API key>
MODEL_NAME="open-mistral-7b"
```

5. **Start the backend server**

```bash
uvicorn main:app --reload --port 8000
```

6. **Verify running**

Open:

```bash
http://127.0.0.1:8000/docs
```

This will show the API documentation.

---

## 🚀 Frontend Setup (Next.js)

1. **Navigate to frontend folder**

```bash
cd frontend
```

2. **Install dependencies**

```bash
npm install
```

or

```bash
yarn
```

3. **Create `.env.local` in `frontend`**

```bash
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

4. **Start the frontend server**

```bash
npm run dev
```

or

```bash
yarn dev
```

5. **Open the frontend**

Visit:

```bash
http://localhost:3000
```

---

## 📌 Quick Usage Flow

1. Go to **Signup**
2. Create an account
3. Login
4. Fill **Profile**
5. Add **Daily Logs**
6. Click **Analyze & Adapt**
7. View **Progress & Suggestions**

---

## 🧠 Tools Used

| Layer    | Technology                    |
| -------- | ----------------------------- |
| Backend  | FastAPI                       |
| Auth     | JWT (JSON Web Tokens)         |
| Database | MongoDB                       |
| AI       | Mistral LLM (Dynamic Planner) |
| Frontend | Next.js (Typescript)          |

---

## 🛠 Troubleshooting

**Backend 404 on signup/login**
➡ Check that `/api/auth/signup` and `/api/auth/login` are included in `main.py`.

**Frontend Errors related to localStorage**
➡ Ensure client components include `"use client"` at the top.

**Token not sent with requests**
➡ Confirm `NEXT_PUBLIC_API_BASE` is correct in `.env.local`.

---

## 📄 License

This system is provided for hackathon/demo use and not for production without security hardening.

---
