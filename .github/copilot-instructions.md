# Copilot Instructions for Fake API Generator

## Project Overview
- **Purpose:** Generate mock REST APIs and resources with advanced querying, relations, and customizable endpoints. Inspired by Mocki.io/MockAPI.io.
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Vanilla CSS, MongoDB, Mongoose, @faker-js/faker, path-to-regexp, Lucide React, NextAuth.js v5.
- **Data Storage:** MongoDB (Atlas cloud or local) with Mongoose ODM for schemas, APIs, and generated data.

## Architecture & Key Patterns
- **Database:** MongoDB with Mongoose models defined in `src/models/index.ts` (Project, Resource, API, Database, UserProfile).
- **Resources:** Stored in MongoDB, managed via `/src/app/api/resources/` endpoints. Each resource has fields, types, and relations.
- **Custom APIs:** Stored in MongoDB, managed via `/src/app/api/apis/`. Allows arbitrary endpoints, methods, status codes, and response bodies.
- **Data Generation:** Uses `src/lib/dataGenerator.ts` and Faker.js for field values. Relations link resources by ID.
- **Endpoints:** RESTful routes auto-generated for each resource under `/api/v1/{resource}`. Supports pagination, sorting, filtering, and CRUD.
- **Pagination/Sorting/Filtering:** Query params (`_page`, `_limit`, `_sort`, `_order`, field filters) handled in resource endpoints. See `README.md` for examples.
- **Authentication:** NextAuth.js v5 with Google OAuth provider.
- **Collaboration:** Projects support multiple collaborators with owner/collaborator roles.
- **Response Format:**
  ```json
  {
    "data": [...],
    "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
  }
  ```
- **Status Codes:** Only valid HTTP status codes (200, 201, 204, 400, etc.) are used. See dropdowns in UI and API logic.
- **Relations:** Use `relation` type fields to link resources (e.g., `userId` in `posts`).
- **Custom Endpoints:** Support dynamic path segments (`:id`, `:slug`) via path-to-regexp.

## Developer Workflows
- **Install:** `npm install`
- **Setup MongoDB:** Follow `MONGODB_SETUP.md` to configure MongoDB Atlas or local MongoDB.
- **Run Dev Server:** `npm run dev` (Next.js)
- **Migration:** Run `npx tsx scripts/migrate-to-mongodb.ts` to migrate old JSON data (if any).
- **Data Generation:** Use UI or call resource endpoints to auto-generate data.
- **Add Resource/API:** Use UI forms/components in `src/components/`.
- **Debugging:** Check API logic in `src/app/api/`, data generation in `src/lib/dataGenerator.ts`, and MongoDB connection in `src/lib/mongodb.ts`.

## Conventions & Patterns
- **Plural resource names** (e.g., `users`, `posts`).
- **Field types:** string, number, boolean, date, email, UUID, image, relation.
- **Faker methods** for string fields (see `README.md`).
- **Relations:** Use `relation` type and reference another resource by name.
- **Custom APIs:** Full control over path, method, status, request body, query params, and response.
- **MongoDB storage:** All data persisted in MongoDB collections with proper indexing.
- **App Router:** All routing via Next.js 15 App Router structure.
- **Always call connectDB()** before any MongoDB operation in API routes.

## Key Files & Directories
- `src/models/` — Mongoose schemas (Project, Resource, API, Database, UserProfile)
- `src/lib/mongodb.ts` — Database connection with caching
- `src/app/api/` — API route handlers
- `src/components/` — UI forms and lists for resources/APIs
- `src/lib/dataGenerator.ts` — core data generation logic
- `MONGODB_SETUP.md` — MongoDB setup instructions
- `README.md` — feature and usage reference

## Example: Add a Resource
1. Use ResourceForm UI to create a resource schema.
2. Resource is saved to MongoDB.
3. Generate data via UI or endpoint.
4. Access via `/api/v1/{resource}` routes.

---

**For AI agents:**
- Always reference `README.md` for feature details and usage patterns.
- Follow plural naming and field conventions.
- Use provided endpoints and query params for data access.
- When adding new features, match the structure and patterns in `src/app/api/` and `src/components/`.
- Keep all data in local JSON files unless extending for DB support.
