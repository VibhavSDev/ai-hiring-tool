# HireAI

HireAI is a full-stack AI hiring platform that helps teams streamline recruitment by automating job creation, resume analysis, candidate scoring, and interview preparation. The application combines a React frontend with an Express API, MongoDB persistence, and AI-powered ranking logic to turn raw candidate data into actionable hiring decisions.

## Overview

This project is designed to support the modern recruiting workflow:

- Create and manage job descriptions
- Upload or paste candidate resumes
- Parse and normalize resume content
- Match candidates against a role using AI scoring
- Review live ranking progress and explanation insights
- Generate interview questions for shortlisted candidates
- Track candidates and jobs in a structured dashboard

## Key Features

- JWT-based authentication and protected routes
- Recruiter dashboard for job and candidate management
- Resume upload with PDF parsing and text extraction
- AI-driven skill, experience, and semantic matching
- Background job processing for candidate scoring using BullMQ and Redis
- Real-time status tracking for scoring jobs
- Interview question generation based on candidate strengths and job requirements
- Candidate analytics and performance summaries

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- Socket.IO client

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Redis + BullMQ
- JWT authentication
- PDF parsing and OCR-related processing
- AI services via Gemini / Hugging Face / local embedding providers

## Repository Structure

```text
ai-hiring-tool/
├── README.md                 # Project overview and setup
├── ai-hiring-tool/           # Frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
└── ai-hiring-tool-backend/   # Backend API and worker services
    ├── src/
    ├── uploads/
    ├── server.js
    ├── app.js
    ├── package.json
    └── .env.example
```

## Prerequisites

Before running the project, ensure you have:

- Node.js 18+ recommended
- MongoDB running locally or remotely
- Redis running locally or accessible via URL
- A valid AI API key for the configured provider (for example Gemini or Hugging Face)

## Environment Setup

### Backend

From the backend directory:

```bash
cd ai-hiring-tool-backend
cp .env.example .env
```

Then configure the environment variables in `.env`, including:

- `MONGO_URI`
- `PORT` (default: `5000`)
- `CORS_ORIGIN` (for example `http://localhost:5173`)
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `GEMINI_API_KEY` or the relevant AI provider key
- `REDIS_URL`

Example backend configuration:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_hiring_tool
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
GEMINI_API_KEY=your-api-key
REDIS_URL=redis://localhost:6379
```

### Frontend

From the frontend directory:

```bash
cd ai-hiring-tool
cp .env.example .env
```

Set the backend URL:

```env
VITE_API_URL=http://localhost:5000
```

## Getting Started

### 1. Install dependencies

Backend:

```bash
cd ai-hiring-tool-backend
npm install
```

Frontend:

```bash
cd ai-hiring-tool
npm install
```

### 2. Start the backend

```bash
cd ai-hiring-tool-backend
npm run dev
```

The API will run on:

- `http://localhost:5000`

### 3. Start the frontend

```bash
cd ai-hiring-tool
npm run dev
```

The application will typically run on:

- `http://localhost:5173`

## Application Workflow

The platform follows a simple recruiting pipeline:

1. Sign up or log in to the system
2. Create a job or role definition
3. Upload resumes or paste candidate text
4. Trigger AI-driven scoring for candidates
5. Review ranked candidates and AI explanations
6. Generate interview questions from the best-fit candidates
7. Continue managing candidates across the hiring pipeline

## API Overview

The backend exposes a versioned API under `/api/v1`.

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

### Jobs

- `GET /api/v1/jobs`
- `POST /api/v1/jobs`
- `GET /api/v1/jobs/:jobId`
- `PATCH /api/v1/jobs/:jobId`
- `DELETE /api/v1/jobs/:jobId`

### Resumes and Parsing

- Resume upload endpoints
- Candidate parsing endpoints
- AI-based text extraction and normalization

### Scoring

- `POST /api/v1/scoring-jobs`
- `GET /api/v1/scoring-jobs/job/:jobId`
- `GET /api/v1/scoring-jobs/:scoringJobId/status`

### Interviews

- Interview question generation endpoints for scored candidates

## Architecture Notes

The project is structured around a clear separation of responsibilities:

- Frontend handles recruiter interaction and dashboard UX
- Backend handles authentication, job and candidate management, and AI orchestration
- MongoDB stores jobs, candidates, resumes, and scoring metadata
- Redis/BullMQ manages asynchronous scoring workflows
- AI providers supply semantic and relevance analysis during ranking

## Production Considerations

This project is a strong foundation for a recruitment product, but for production use you should also consider:

- Stronger secret management and environment isolation
- Role-based authorization for admin and recruiter access
- Rate limiting and abuse protection for file uploads and AI requests
- Better file validation and resume sanitization
- Backup and observability for MongoDB, Redis, and queue processing
- CI/CD and automated tests for the backend and frontend

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the relevant tests and validation checks
5. Submit a pull request with a clear summary

## License

This project currently does not define a formal license in the repository. If you plan to distribute or commercialize it, add an appropriate license file before doing so.

## Summary

HireAI is built to help hiring teams move faster by combining document parsing, AI matching, and recruiter workflows in one platform. It is especially useful for teams that want a more intelligent, data-driven alternative to traditional resume review and manual shortlisting.
