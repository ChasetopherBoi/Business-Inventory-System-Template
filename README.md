# Business Inventory System Template

A full-stack inventory management application built with **FastAPI (Python)** and **React (Vite)** designed to demonstrate modern web architecture, REST API design, and role-based business workflows.

**Live on Render : https://business-inventory-system-template.onrender.com/**

---

## 🚀 Tech Stack

### Backend

- **FastAPI** — High-performance Python web framework
- **Pydantic** — Data validation and serialization
- **SQLAlchemy** — ORM for database operations
- **JWT Authentication** — Secure token-based auth
- **Role-based Access Control** — Admin and User roles
- **Static File Serving** — Product image hosting

### Frontend

- **React + Vite** — Modern UI with optimized tooling
- **React Router** — Client-side navigation and protected routes
- **Bootstrap** — Responsive styling
- **Context API** — State management for cart and auth

---

## ✨ Features

- 🔐 JWT-based user authentication
- 👤 Role-based access control (Admin/User dashboards)
- 📦 Inventory CRUD operations
- 🛒 Shopping cart functionality
- 🖼️ Product image upload and serving
- 🔍 Category filtering and search
- ⚙️ RESTful API (`/api/v1/...`)
- 📱 Responsive design

---

## 📁 Project Structure

```
backend/
├── app/
│ ├── api/ # Versioned API routes
│ ├── models/ # SQLAlchemy models
│ ├── schemas/ # Pydantic schemas
│ ├── services/ # Business logic
│ ├── static/uploads/ # Uploaded product images
│ └── main.py # FastAPI entry point

frontend/
├── src/
│ ├── pages/
│ ├── components/
│ ├── context/
│ └── assets/
└── dist/ # Production build

```

## 🛠 Local Development Setup

### 1️⃣ Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at: http://127.0.0.1:8000/docs

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at: http://localhost:5173

🏗 Production Build

```bash
cd frontend
npm run build
```

🔐 Example Roles

| Role      | Permissions                    |
| --------- | ------------------------------ |
| **Admin** | Full inventory management      |
| **Shop**  | Shop, add to cart, view orders |
