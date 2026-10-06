# Freelance & Agency Portfolio Backend

## Project Overview

This FastAPI backend serves as the core API service for a dynamic freelancing and agency portfolio platform. It manages portfolio projects, services, client testimonials, contact inquiries, and admin functionality via a RESTful API backed by PostgreSQL.

---

## Current Part

**Part 4 — Services, Testimonials & Contact/Inquiries API** [Completed]

---

## Tech Stack

| Technology            | Purpose                                   |
| :-------------------- | :---------------------------------------- |
| **Python 3.10+**      | Backend Programming Language              |
| **FastAPI**           | High-performance Web Framework            |
| **Uvicorn**           | ASGI Web Server                           |
| **PostgreSQL 18**     | Relational Database                       |
| **SQLAlchemy 2.x**    | Object Relational Mapper (ORM)            |
| **psycopg (v3)**      | PostgreSQL Database Driver                |
| **Alembic**           | Database Schema Migration Tool            |
| **Pydantic v2**       | Data Validation and Serialization         |
| **pydantic-settings** | Type-safe Environment Settings Management |
| **python-dotenv**     | Environment Variable Loader               |

---

## Architecture Overview

```text
FastAPI Routers (/api/projects, /api/services, /api/testimonials, /api/contact)
       │
       ▼
Pydantic Schemas (Create / Update / Response DTOs with validation)
       │
       ▼
SQLAlchemy 2.x ORM Models (Project, Service, Testimonial, ContactInquiry)
       │
       ▼
Database Session (get_db dependency with auto-cleanup)
       │
       ▼
PostgreSQL Database (projects, services, testimonials, contact_inquiries tables)
```

---

## Project Structure

```text
backend/
├── app/
│   ├── __init__.py         # Package identifier
│   ├── main.py             # FastAPI app initialization, middleware, router registration
│   ├── config.py           # Pydantic Settings configuration (loads .env)
│   ├── database.py         # Engine, SessionLocal, Base model, session dependency, health check
│   ├── models/
│   │   ├── __init__.py     # Model imports for Alembic autogenerate
│   │   ├── project.py      # Project ORM model (`projects` table)
│   │   ├── service.py      # Service ORM model (`services` table)
│   │   ├── testimonial.py  # Testimonial ORM model (`testimonials` table)
│   │   └── contact.py      # ContactInquiry ORM model (`contact_inquiries` table) & InquiryStatus enum
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── project.py      # Project schemas (ProjectCreate, ProjectUpdate, ProjectResponse)
│   │   ├── service.py      # Service schemas (ServiceCreate, ServiceUpdate, ServiceResponse)
│   │   ├── testimonial.py  # Testimonial schemas (TestimonialCreate, TestimonialUpdate, TestimonialResponse)
│   │   └── contact.py      # Contact schemas (ContactInquiryCreate, ContactInquiryUpdate, ContactInquiryResponse)
│   └── routes/
│       ├── __init__.py
│       ├── projects.py     # /api/projects CRUD API endpoints
│       ├── services.py     # /api/services CRUD API endpoints
│       ├── testimonials.py # /api/testimonials CRUD API endpoints
│       └── contact.py      # /api/contact Inquiries API endpoints
├── alembic/
│   ├── env.py              # Alembic environment runner (loads DATABASE_URL dynamically)
│   └── versions/           # Database migration revision scripts
├── alembic.ini             # Alembic configuration file (no hardcoded secrets)
├── .env                    # Environment variables (ignored by Git)
├── .env.example            # Environment variables template (committed to Git)
├── .gitignore              # Git ignore configuration
├── requirements.txt        # Python package dependencies
├── test_app.py             # Automated end-to-end verification test suite
└── README.md               # Backend documentation
```

---

## Setup Instructions (Windows PowerShell)

### 1. Navigate into the Backend Directory

```powershell
cd backend
```

### 2. Create a Python Virtual Environment

```powershell
python -m venv venv
```

### 3. Activate the Virtual Environment

```powershell
.\venv\Scripts\Activate.ps1
```

> _If execution is blocked by policy, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`_

### 4. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 5. Configure Environment Variables

```powershell
Copy-Item .env.example .env
```

Update `.env` with your actual local PostgreSQL password in `DATABASE_URL`.

---

## Database Migrations (Alembic)

Database schema management is handled strictly via Alembic migrations.

### Apply Migrations to Database

```powershell
.\venv\Scripts\alembic.exe upgrade head
```

---

## Running the Server

Start the FastAPI development server:

```powershell
.\venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```

Access the application at `http://127.0.0.1:8000`.

---

## API Endpoints Summary

> ⚠️ **Authentication Note**: Admin management endpoints (GET/PUT/DELETE for contact inquiries, write operations for projects, services, testimonials) will be protected by JWT authentication in **Part 5**.

### 1. Core & Health Endpoints

- `GET /` — Root backend status confirmation
- `GET /api/health` — Application health check (no DB dependency)
- `GET /api/db-health` — PostgreSQL database connection probe

### 2. Projects API (`/api/projects`)

- `GET /api/projects/` — List projects (paginated, ordered newest first, filter by `category`)
- `GET /api/projects/{id}` — Get single project by ID
- `POST /api/projects/` — Create new project
- `PUT /api/projects/{id}` — Update existing project
- `DELETE /api/projects/{id}` — Delete project

### 3. Services API (`/api/services`)

- `GET /api/services/` — List services (ordered by `display_order` asc, `created_at` desc; filter by `featured`, pagination via `skip` & `limit`)
- `GET /api/services/{id}` — Get single service by ID
- `POST /api/services/` — Create new service
- `PUT /api/services/{id}` — Update service
- `DELETE /api/services/{id}` — Delete service

### 4. Testimonials API (`/api/testimonials`)

- `GET /api/testimonials/` — List testimonials (ordered by `display_order` asc, `created_at` desc; filter by `featured`, pagination via `skip` & `limit`)
- `GET /api/testimonials/{id}` — Get single testimonial by ID
- `POST /api/testimonials/` — Create new testimonial
- `PUT /api/testimonials/{id}` — Update testimonial
- `DELETE /api/testimonials/{id}` — Delete testimonial

### 5. Contact Inquiries API (`/api/contact`)

- `POST /api/contact/` — **Public** contact form submission (status is automatically set to `"new"`)
- `GET /api/contact/` — List inquiries (ordered newest first; filter by `status`: `new`, `read`, `replied`, `archived`; pagination via `skip` & `limit`)
- `GET /api/contact/{id}` — Get single inquiry by ID
- `PUT /api/contact/{id}` — Update inquiry status or details
- `DELETE /api/contact/{id}` — Delete inquiry

---

## Endpoint Examples

### Services

#### `POST /api/services`

**Request Payload:**

```json
{
  "title": "API Development & Integration",
  "slug": "api-development-integration",
  "description": "Custom FastAPI backend development, database architecture, and REST API design.",
  "icon": "code-bracket",
  "featured": true,
  "display_order": 1
}
```

**Response (`201 Created`):**

```json
{
  "id": 1,
  "title": "API Development & Integration",
  "slug": "api-development-integration",
  "description": "Custom FastAPI backend development, database architecture, and REST API design.",
  "icon": "code-bracket",
  "featured": true,
  "display_order": 1,
  "created_at": "2026-10-06T22:50:00Z",
  "updated_at": "2026-10-06T22:50:00Z"
}
```

#### `GET /api/services?featured=true&skip=0&limit=10`

**Response (`200 OK`):**

```json
[
  {
    "id": 1,
    "title": "API Development & Integration",
    "slug": "api-development-integration",
    "description": "Custom FastAPI backend development, database architecture, and REST API design.",
    "icon": "code-bracket",
    "featured": true,
    "display_order": 1,
    "created_at": "2026-10-06T22:50:00Z",
    "updated_at": "2026-10-06T22:50:00Z"
  }
]
```

---

### Testimonials

#### `POST /api/testimonials`

**Request Payload:**

```json
{
  "client_name": "Jane Doe",
  "client_role": "CTO",
  "company": "TechCorp",
  "content": "Delivered our backend API ahead of schedule with exceptional quality.",
  "rating": 5,
  "avatar_url": "https://example.com/avatar.jpg",
  "featured": true,
  "display_order": 1
}
```

**Response (`201 Created`):**

```json
{
  "id": 1,
  "client_name": "Jane Doe",
  "client_role": "CTO",
  "company": "TechCorp",
  "content": "Delivered our backend API ahead of schedule with exceptional quality.",
  "rating": 5,
  "avatar_url": "https://example.com/avatar.jpg",
  "featured": true,
  "display_order": 1,
  "created_at": "2026-10-06T22:50:00Z",
  "updated_at": "2026-10-06T22:50:00Z"
}
```

#### `GET /api/testimonials?featured=true`

**Response (`200 OK`):**

```json
[
  {
    "id": 1,
    "client_name": "Jane Doe",
    "client_role": "CTO",
    "company": "TechCorp",
    "content": "Delivered our backend API ahead of schedule with exceptional quality.",
    "rating": 5,
    "avatar_url": "https://example.com/avatar.jpg",
    "featured": true,
    "display_order": 1,
    "created_at": "2026-10-06T22:50:00Z",
    "updated_at": "2026-10-06T22:50:00Z"
  }
]
```

---

### Contact Inquiries

#### `POST /api/contact` (Public Form)

**Request Payload:**

```json
{
  "name": "Alex Smith",
  "email": "alex.smith@example.com",
  "subject": "Inquiry regarding API project",
  "message": "We would like to hire your team for building our SaaS backend system."
}
```

**Response (`201 Created`):**

```json
{
  "id": 1,
  "name": "Alex Smith",
  "email": "alex.smith@example.com",
  "subject": "Inquiry regarding API project",
  "message": "We would like to hire your team for building our SaaS backend system.",
  "status": "new",
  "created_at": "2026-10-06T22:50:00Z",
  "updated_at": "2026-10-06T22:50:00Z"
}
```

#### `GET /api/contact?status=new&skip=0&limit=20` (Admin Query)

**Response (`200 OK`):**

```json
[
  {
    "id": 1,
    "name": "Alex Smith",
    "email": "alex.smith@example.com",
    "subject": "Inquiry regarding API project",
    "message": "We would like to hire your team for building our SaaS backend system.",
    "status": "new",
    "created_at": "2026-10-06T22:50:00Z",
    "updated_at": "2026-10-06T22:50:00Z"
  }
]
```

---

## API Documentation

FastAPI automatically generates interactive documentation:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Automated Verification & Testing

Run the automated end-to-end test suite:

```powershell
$env:PYTHONIOENCODING="utf-8"
.\venv\Scripts\python.exe test_app.py
```

The test suite validates:

1. Root `GET /`, `/api/health`, `/docs`, `/redoc`
2. `GET /api/db-health` PostgreSQL connectivity check
3. Projects CRUD API, pagination, category filtering, unique slug constraints, updates, and deletion
4. Services CRUD API, display order sorting, featured filter, unique slug constraints, validation rules, and deletion
5. Testimonials CRUD API, rating range validation (1-5), avatar URL validation, featured filtering, and deletion
6. Contact Inquiries API, public form submission forcing status `"new"`, email format validation, admin query status filtering (`?status=new`), status updates, and deletion

---

## Project Roadmap

- [x] **Part 1 — FastAPI Backend Foundation**
- [x] **Part 2 — PostgreSQL Database Setup**
- [x] **Part 3 — Projects CRUD API**
- [x] **Part 4 — Services, Testimonials & Contact API**
- [ ] **Part 5 — Admin Authentication & Security**
- [ ] **Part 6 — Admin Dashboard/API Integration**
- [ ] **Part 7 — Frontend ↔ Backend Integration**
- [ ] **Part 8 — Deployment & Reusable Template**
