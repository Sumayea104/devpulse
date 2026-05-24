# 🚼 DevPulse - Internal Tech Issue & Feature Tracker

## 🌐 Live URL

API Base URL: `https://devpulse-production-7845.up.railway.app`

## 📖 Project Overview

DevPulse is a collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions. Built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL** using **raw SQL queries** (no ORM, no JOINs).

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with role selection (contributor/maintainer)
- Secure login with JWT token (plain token in Authorization header)
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (RBAC)

### 🐛 Issue Management
- Create issues (bug reports or feature requests)
- View all issues with **filtering** (by type/status) and **sorting** (newest/oldest)
- View single issue details with reporter information
- Update issues (title, description, type)
- Delete issues (maintainers only)

### 👥 Role-Based Permissions

| Role | Permissions |
|------|-------------|
| **Contributor** | – Register & login<br>– Create new issues<br>– View all issues<br>– Update own issues (only if status is `open`) |
| **Maintainer** | – All contributor permissions<br>– Update any issue field (including status)<br>– Delete any issue<br>– Access system metrics |

### 📊 System Metrics (Maintainer only)
- Total issues count
- Breakdown by status (open, in_progress, resolved)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 24.x |
| **Language** | TypeScript (strict mode) |
| **Framework** | Express.js |
| **Database** | PostgreSQL (NeonDB / Render PostgreSQL) |
| **Database Driver** | `pg` (raw SQL only - no ORM, no JOINs) |
| **Authentication** | JWT + bcrypt |
| **Security** | CORS, Helmet, Rate Limiting |
| **Deployment** | Railway / Render |

---
## 📂 Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   └── errorHandler.ts      # Global error handler
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   └── issues/
│   │       ├── issues.controller.ts
│   │       └── issues.routes.ts
│   ├── utils/
│   │   └── response.ts          # Standardized API response
│   ├── types/
│   │   └── express.d.ts         # TypeScript type extensions
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── sql/
│   └── schema.sql               # Database schema
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```


---

## 🗄️ Database Schema Summary

### Users Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password` | TEXT | NOT NULL |
| `role` | VARCHAR(20) | DEFAULT 'contributor' (contributor/maintainer) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP (auto-updated) |

### Issues Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `title` | VARCHAR(150) | NOT NULL |
| `description` | TEXT | NOT NULL (min 20 chars) |
| `type` | VARCHAR(20) | CHECK (bug / feature_request) |
| `status` | VARCHAR(20) | DEFAULT 'open' (open / in_progress / resolved) |
| `reporter_id` | INTEGER | NOT NULL (references users.id) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP (auto-updated) |

**⚠️ Important:** No foreign key constraints are used. Application layer handles data integrity with manual validation. No SQL JOINs are used - reporter data is fetched in separate queries and merged in application layer.

---

## 🔌 API Endpoints

### Authentication Module

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |

### Issues Module

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/issues` | Public | Get all issues (with filtering & sorting) |
| `GET` | `/api/issues/:id` | Public | Get a single issue by ID |
| `POST` | `/api/issues` | Authenticated | Create a new issue |
| `PATCH` | `/api/issues/:id` | Authenticated | Update an issue (role-based) |
| `DELETE` | `/api/issues/:id` | Maintainer only | Delete an issue |
| `GET` | `/api/issues/metrics/overview` | Maintainer only | Get system metrics |

### Query Parameters (GET /api/issues)

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `sort` | `newest`, `oldest` | `newest` | Sort by creation date |
| `type` | `bug`, `feature_request` | (none) | Filter by issue type |
| `status` | `open`, `in_progress`, `resolved` | (none) | Filter by issue status |

**Example:** `GET /api/issues?sort=newest&type=bug&status=open`

---

## 📦 Setup Instructions

### Prerequisites

- **Node.js** 24.x or higher
- **PostgreSQL** database (local or cloud - NeonDB / Render)
- **npm** or **yarn**

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sumayea104/devpulse.git
cd devpulse

```
### Step 2: Install Dependencies

```
npm install

```

### Step 3: Configure Environment Variables

-Create a .env file in the root directory:

```
PORT=5000
NODE_ENV=development

# Database (NeonDB / Render PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/devpulse?sslmode=require

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production

# Bcrypt
BCRYPT_SALT_ROUNDS=10

```

Step 4: Set Up Database
Run the schema in your PostgreSQL database:

```
# Using psql
psql your_database_url < sql/schema.sql

# Or copy the SQL from sql/schema.sql and run in NeonDB SQL Editor

```

### Step 5: Run the Application

```
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start

```
### Step 6: Test the API

```
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"123456","role":"contributor"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'

# Create an issue (use the token from login)
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bug found","description":"This is a detailed description with at least 20 characters","type":"bug"}'

```

### 📋 API Response Format
- Success Response

```
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```
### Error Response

```
{
  "success": false,
  "message": "Error description",
  "data": null
}

```
## 🔢 HTTP Status Codes Reference

| Status Code | Meaning | When to Use |
|-------------|---------|-------------|
| **200 OK** | Request succeeded | Successful GET, PATCH, DELETE requests |
| **201 Created** | Resource created | Successful POST request (new user/issue) |
| **400 Bad Request** | Invalid input | Validation fails (missing fields, wrong format) |
| **401 Unauthorized** | No/invalid token | Missing JWT or token expired/invalid |
| **403 Forbidden** | Insufficient role | Valid token but user lacks permission |
| **404 Not Found** | Resource missing | Requested user/issue doesn't exist |
| **409 Conflict** | Business rule violation | Contributor trying to edit non-open issue |
| **500 Internal Server Error** | Server error | Unexpected database or server failure |

---
## 🚀 Deployment

### Deploy to Railway (Recommended)

1. Push code to GitHub
2. Create account at [Railway.app](https://railway.app)
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `devpulse` repository
5. Add environment variables:
   - `PORT` = `5000`
   - `DATABASE_URL` = your NeonDB URL
   - `JWT_SECRET` = your secret key
   - `BCRYPT_SALT_ROUNDS` = `10`
6. Set **Build Command**: `npm run build`
7. Set **Start Command**: `npm start`
8. Railway auto-deploys on every push ✅


### Database (NeonDB)

1. Create account at [Neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add `?sslmode=require` at the end
5. Use as `DATABASE_URL` in environment variables

> **Example DATABASE_URL:**
> ```
> postgresql://username:password@ep-cool-hill-123456.ap-southeast-1.aws.neon.tech/devpulse?sslmode=require
> ```
---

## 📚 Learnings & Challenges

Faced several challenges during development. 
➡️ **[See detailed learnings](./docs/learnings.md)**

---
## 👨‍💻 Author

**Sumayea Rahman**  
GitHub: [@Sumayea104](https://github.com/Sumayea104)

## 📄 License

MIT

## 🙏 Acknowledgments

- Assignment requirements following strict rules (no JOINs, no ORM, exact endpoint matching)
- Built with TypeScript for type safety
- Raw SQL for maximum control and performance

## 🔗 Links

- **Live API:** [https://devpulse-production-7845.up.railway.app](https://devpulse-production-7845.up.railway.app)
- **GitHub Repository:** [https://github.com/Sumayea104/devpulse](https://github.com/Sumayea104/devpulse)
- **Health Check:** [https://devpulse-production-7845.up.railway.app/health](https://devpulse-production-7845.up.railway.app/health) 
