# Copilot Instructions for Fake API Generator

## Project Overview
- **Purpose:** Generate mock REST APIs and resources with advanced querying, relations, and customizable endpoints. Inspired by Mocki.io/MockAPI.io.
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Vanilla CSS, @faker-js/faker, path-to-regexp, Lucide React.
- **Data Storage:** Local JSON files in `data/` for schemas, APIs, and generated data.

## Architecture & Key Patterns
- **Resources:** Defined in `data/resources.json`, managed via `/src/app/api/resources/` endpoints. Each resource has fields, types, and relations.
- **Custom APIs:** Defined in `data/apis.json`, managed via `/src/app/api/apis/`. Allows arbitrary endpoints, methods, status codes, and response bodies.
- **Data Generation:** Uses `src/lib/dataGenerator.ts` and Faker.js for field values. Relations link resources by ID.
- **Endpoints:** RESTful routes auto-generated for each resource under `/api/v1/{resource}`. Supports pagination, sorting, filtering, and CRUD.
- **Pagination/Sorting/Filtering:** Query params (`_page`, `_limit`, `_sort`, `_order`, field filters) handled in resource endpoints. See `README.md` for examples.
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
- **Run Dev Server:** `npm run dev` (Next.js)
- **Data Generation:** Use UI or call resource endpoints to auto-generate data.
- **Add Resource/API:** Update JSON files in `data/` or use UI forms/components in `src/components/`.
- **Debugging:** Check API logic in `src/app/api/` and data generation in `src/lib/dataGenerator.ts`.

## Conventions & Patterns
- **Plural resource names** (e.g., `users`, `posts`).
- **Field types:** string, number, boolean, date, email, UUID, image, relation.
- **Faker methods** for string fields (see `README.md`).
- **Relations:** Use `relation` type and reference another resource by name.
- **Custom APIs:** Full control over path, method, status, and response.
- **Local JSON storage:** No database; all data is in `data/`.
- **App Router:** All routing via Next.js 15 App Router structure.

## Key Files & Directories
- `data/` — schemas, APIs, generated data
- `src/app/api/` — API route handlers
- `src/components/` — UI forms and lists for resources/APIs
- `src/lib/dataGenerator.ts` — core data generation logic
- `README.md` — feature and usage reference

## Example: Add a Resource
1. Add schema to `data/resources.json` or use ResourceForm UI.
2. Generate data via UI or endpoint.
3. Access via `/api/v1/{resource}` routes.

---

**For AI agents:**
- Always reference `README.md` for feature details and usage patterns.
- Follow plural naming and field conventions.
- Use provided endpoints and query params for data access.
- When adding new features, match the structure and patterns in `src/app/api/` and `src/components/`.
- Keep all data in local JSON files unless extending for DB support.
