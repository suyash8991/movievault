# 🎬 Movie Vault — Full-Stack Movie Database & Recommendation Platform

> A production-grade web application built with **Next.js + Express.js + PostgreSQL**, demonstrating enterprise-level architecture, authentication, and Test-Driven Development.

---

## 📖 Overview

**Movie Vault** is a full-stack movie discovery and personalization app powered by the **TMDb API**.  
It showcases professional-grade software engineering practices:
- Clean Architecture (Controller → Service → Repository → Database)
- Test-Driven Development (TDD)
- Secure JWT Authentication with Refresh Token Rotation
- Caching & Performance Optimization
- CI/CD Pipeline with Docker & GitHub Actions

---

## ✨ Features

- 🔐 **User Authentication** — Register, login, refresh, logout (JWT + bcrypt)
- 🎬 **Movie Search & Details** — TMDb API integration with caching and error handling
- ⭐ **Watchlist & Ratings** — Persistent user preferences and movie ratings with reviews (1-10 scale)
- 🧠 **AI-Powered Recommendations** — Collaborative & content-based filtering
- 📱 **Responsive UI** — Modern Next.js frontend with Tailwind CSS and Framer Motion
- 🧪 **100% TDD Compliance** — Unit, integration, and API tests across modules

---

## 🧱 Architecture

```

Frontend (Next.js 15 + TypeScript)
│
▼
Express Backend (API) ──► Service Layer ──► Repository ──► Prisma ORM ──► PostgreSQL
│
├── JWT Auth Middleware
├── Zod Validation Layer
├── TMDb API Integration
└── Redis Cache (optional)

````

Clean separation of concerns ensures maintainability and scalability.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js 15 / TypeScript, Tailwind CSS, Framer Motion, React Query, Zustand |
| **Backend** | Node.js, Express.js 5, TypeScript, Prisma ORM, Zod, bcrypt |
| **Database** | PostgreSQL (Neon Cloud) + Redis (optional cache) |
| **Testing** | Jest, Supertest, React Testing Library, Playwright |
| **Deployment** | Docker Compose, Vercel (frontend), Railway / Render (backend), GitHub Actions CI/CD |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/movie-vault.git
cd movie-vault
````

### 2️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3️⃣ Environment Configuration

Create a `.env` file in `backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/movievault?schema=public"
JWT_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
TMDB_API_KEY="your-tmdb-api-key"
PORT=5000
```

Create a `.env.local` in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🧪 Development & Testing

### Run Database Migrations

```bash
cd backend
npx prisma migrate dev
```

### Start Servers

```bash
# Backend
npm run dev  # http://localhost:5000

# Frontend
cd ../frontend
npm run dev  # http://localhost:3000
```

### Run Tests

```bash
# Backend tests
cd backend
npm test
```

TDD cycle (`Red → Green → Refactor`) ensures robust features and clean code.

---

## 🧩 API Endpoints (Summary)

| Method              | Endpoint                     | Description                                       |
| ------------------- | ---------------------------- | ------------------------------------------------- |
| **POST**            | `/api/auth/register`         | Register a new user                               |
| **POST**            | `/api/auth/login`            | Login and receive tokens                          |
| **POST**            | `/api/auth/refresh`          | Refresh access token                              |
| **GET**             | `/api/movies`                | Get movies with filters (pagination, genre, year) |
| **GET**             | `/api/movies/search`         | Search movies by title                            |
| **GET**             | `/api/movies/:id`            | Movie details + recommendations                   |
| **GET/PUT**         | `/api/users/profile`         | Retrieve / update user profile                    |
| **GET/POST/DELETE** | `/api/users/watchlist`       | Manage watchlist                                  |
| **POST**            | `/api/movies/:id/ratings`    | Rate a movie (1-10) with optional review          |
| **GET**             | `/api/movies/:id/ratings`    | Get all ratings for a movie with average          |
| **GET**             | `/api/users/ratings`         | Get user's movie ratings                          |
| **DELETE**          | `/api/movies/:id/ratings`    | Delete user's rating for a movie                  |

For full specifications, see [`docs/API_endpoint.md`](docs/API_endpoint.md).

---

## 🧪 Testing Strategy

* **Unit Tests** — Service logic and utilities
* **Integration Tests** — API endpoints & DB operations
* **E2E Tests** — User flows with Playwright
* **Coverage Target** — ≥ 80 % backend

Example TDD workflow:

```
RED → Write failing test  
GREEN → Write minimum code to pass  
REFACTOR → Clean and optimize code
```

---

## 🛡️ Security

* **JWT Auth** with access/refresh rotation
* **bcrypt (12 salt rounds)** for password hashing
* **Zod Validation** for input schemas
* **CORS** configured for localhost and production domains
* **Rate-limiting and XSS prevention** via middleware

---

## 🐳 Deployment

### Docker Compose

```bash
docker-compose up -d
```

Exposes:

* Frontend → `http://localhost:3000`
* Backend → `http://localhost:5000`

### CI/CD with GitHub Actions

Automatic tests → build → deploy to Vercel (frontend) & Railway (backend).

---

## 📊 Performance Metrics

| Metric                | Target            |
| --------------------- | ----------------- |
| 🧠 API Response Time  | < 100 ms          |
| 🧪 Test Coverage      | ≥ 80 %            |
| ⚙️ Cache Hit Rate     | ≈ 70 %            |
| 🔐 Security Incidents | 0 (high severity) |

---

## 📂 Project Structure

```
movie-vault/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── middleware/
│   ├── prisma/
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│
└── docs/   # Architecture & TDD guides
```

---

## 📈 Future Enhancements

* 🔔 Push notifications & PWA offline support
* 🧮 Advanced hybrid recommendation engine
* 🌐 Internationalization (i18n)
* 🤖 LLM-based chat assistant for movie queries

---

## 🧑‍💻 Contributing

Contributions are welcome! Please fork the repo and submit a PR after running:

```bash
npm run lint
npm test
```


> *“Built with discipline, tested with rigor, and architected for scalability.”*


