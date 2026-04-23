# Personal Bookkeeping System (Sistem Pembukuan Pribadi)

A high-performance API built with **ElysiaJS**, **Bun**, **PostgreSQL**, and **Drizzle ORM**. This system helps manage personal finances including users, pockets (kantong), transaction types, and more.

## Tech Stack
- **Framework**: [ElysiaJS](https://elysiajs.com/)
- **Runtime**: [Bun](https://bun.sh/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Containerization**: [Docker](https://www.docker.com/)

---

## Prerequisites
- **Docker** and **Docker Compose** installed.
- **Bun** (optional, if running outside Docker).

---

## Getting Started

### 1. Environment Setup
Copy the example environment file and adjust the values if necessary:
```bash
cp .env.example .env
```

### 2. Run with Docker
The easiest way to start the project is using Docker Compose. This will spin up both the PostgreSQL database and the API server.

```bash
docker-compose up --build -d
```

### 3. Setup Database Schema
After the database container is running, push the schema to the database:

**If running locally with Bun:**
```bash
bun db:push
```

### 4. API Access
Once the containers are running:
- **API Base URL**: `http://localhost:3000`
- **Interactive API Docs (Swagger)**: `http://localhost:3000/swagger`

---

## Development

To run the project in development mode (with hot-reload) outside Docker:

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Start the database only**:
   ```bash
   docker-compose up -d db
   ```

3. **Run dev server**:
   ```bash
   bun dev
   ```
