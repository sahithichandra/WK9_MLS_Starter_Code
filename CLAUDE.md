# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThreadHive is a full-stack Reddit clone with a Node.js/Express backend and a React/Vite frontend, organized as a monorepo.

## Commands

### Backend (`threadhive-backend/`)
```bash
npm run dev          # Start dev server with Nodemon
npm start            # Start production server
npm test             # Run all tests with Vitest
npm run populate     # Seed database with sample data
npm run format       # Format code with Prettier
```

### Frontend (`threadhive-frontend/`)
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run all tests with Vitest
npm run test:ui      # Run tests with Vitest UI dashboard
npm run test:coverage # Generate coverage report
```

### Running a single test
```bash
# Backend
npx vitest run tests/unit/controllers/threads.test.js

# Frontend
npx vitest run tests/unit/components/Thread.test.jsx
```

## Environment Setup

Backend requires a `.env` file (copy from `.env.example`):
```
MONGODB_URI=mongodb://localhost:27017/w04Express
PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

## Architecture

### Backend (`threadhive-backend/src/`)

RESTful Express API with MongoDB/Mongoose. All routes are prefixed with `/api/`.

- **`app.js`** — Express app configuration (CORS, Helmet, rate limiting, route mounting)
- **`server.js`** / **`main.js`** — Server startup/shutdown
- **`db.js`** — MongoDB connection
- **`models/`** — Mongoose schemas: User (hashed passwords), Thread (upvotes/downvotes with voter tracking), Subreddit, Comment
- **`controllers/`** — Route handlers; thin layer that delegates to services
- **`routes/`** — Express routers for `threads`, `subreddits`, `auth`, `comments`, `votes`
- **`services/`** — Business logic layer
- **`middleware/`** — JWT auth middleware, error handling
- **`scripts/`** — Database population scripts

Authentication uses JWT tokens (jsonwebtoken + bcryptjs). The Thread model tracks `upvotedBy`/`downvotedBy` arrays to prevent duplicate votes.

Tests use `mongodb-memory-server` for isolated in-memory DB testing. Test timeout is 60 seconds.

### Frontend (`threadhive-frontend/src/`)

React 19 + Vite app using Redux Toolkit for global state and React Bootstrap for UI.

- **`App.jsx`** — Root component with React Router routes
- **`pages/`** — Top-level page components: Auth (login/register), Home (feed), ThreadPage (single thread), Profile
- **`components/`** — Reusable UI components
- **`store/`** — Redux store configuration
- **`reducers/`** — Redux slices: `auth`, `threads`, `currentThread`, `comments`, `theme`, `subreddits`
- **`services/`** — API call functions
- **`api/`** — Axios instance with base URL and auth token injection
- **`config/`** — API endpoint configuration

Tests use Vitest + React Testing Library with MSW (`tests/mocks/`) for API mocking.

### Planned AI Features

See `resources/prompts.md` for two Gemini API integrations in development:
1. **Thread Summary** — One-paragraph thread summaries via Gemini
2. **Rephrase Text** — AI text improvement for threads/comments with user accept/reject flow
