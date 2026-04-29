# Insighta Labs Backend API

## Architecture
- Express.js + MongoDB (Mongoose)
- JWT tokens (access 3min, refresh 5min)
- Redis not used; refresh tokens stored in MongoDB

## Authentication Flow (PKCE)
1. Client (CLI/browser) requests `/auth/github` with `code_challenge`
2. GitHub OAuth redirects to `/auth/github/callback`
3. Backend exchanges code, creates/retrieves user, issues tokens
4. Refresh token is stored in DB, access token signed with JWT

## Role Enforcement
- Middleware `authenticate` extracts user, `requireAdmin` checks role
- Admin: POST, DELETE profiles
- Analyst: GET only

## Natural Language Parsing
- Rule‑based (regex) mapping: "young" → age 16-24, "males" → gender=male, etc.
- Limitations: no AND/OR, single country only
