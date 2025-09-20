# Projects and Notes API

## Description

A high-performance RESTful API built with Express.js 5.x and TypeScript that provides a creation of projects and notes system with intelligent caching capabilities. The API features robust data validation, in-memory caching with TTL (Time To Live), and comprehensive error handling.

## Prerequisites

- Node.js 20.x or higher Recommended (v23.11.1)
- npm

## How to Run

```bash
# Install dependencies
npm install

# Development mode
npm run dev
```

## API Endpoints

### Default Route

#### `GET /api/v1/`

**Description:** Health check endpoint that returns basic API information and status.

**Example Request:**

```bash
# cURL
curl -X GET http://localhost:8000/api/v1/
```

**Response:**

- **200 OK** - API is running successfully

```json
{
  "message": "Projects and Notes API",
  "status": "running",
  "version": "1.0.0"
}
```

---

### Project Routes

#### `GET /api/v1/projects`

**Description:** Retrieves a list of all projects in the system.

**Example Request:**

```bash
# cURL
curl -X GET http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json"
```

**Response:**

- **200 OK** - Successfully retrieved projects list

```json
{
   [
      {
         "id": "project-uuid",
         "name": "Project Name"
      }
   ]
}
```

#### `POST /api/v1/projects`

**Body:**

- `name` (string, required) - The name of the project

**Description:** Creates a new project in the system.

**Example Request:**

```bash
# cURL
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Project"
  }'
```

**Request Body:**

```json
{
  "name": "Project Name"
}
```

**Response:**

- **201 Created**

```json
{
  "id": "project-uuid",
  "name": "Project Name"
}
```

- **422 Bad Request** - Validation error

**Description:** this error comes from the validation middleware where zod is used.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 2 characters long"
    },
    {
      "field": "name",
      "message": "Name can only contain letters and spaces"
    }
  ]
}
```

---

### Notes Routes

#### `GET /api/v1/projects/:projectId/notes`

**Description:** Retrieves all notes associated with a specific project. Notes are sorted by creation date (latest first). Returns 10 notes by default with a maximum limit of 50 notes per request.

**Parameters:**

- `projectId` (string, required) - The unique identifier of the project
- `limit` (string, optional) - The maximum number of notes to retrieve is 50 cap (default: 10)

**Example Request:**

```bash
# cURL
curl -X GET http://localhost:8000/api/v1/projects/project-uuid/notes?limit \
  -H "Content-Type: application/json"
```

**Response:**

- **200 OK** - Successfully retrieved notes list

```json
{
  "projectId": "project-uuid",
  "notes": [
    {
      "id": "note-uuid",
      "projectId": "project-uuid",
      "text": "Test note text",
      "createdAt": "date-time"
    }
  ],
  "total": total number of notes,
  "limit": limit number of notes
}
```

- **422 Unprocessable Entity** - Project ID is invalid

```json
{
  "message": "Project ID is required"
}
```

- **404 Not Found** - Project not found

```json
{
  "error": "Project not found"
}
```

#### `POST /projects/:projectId/notes`

**Description:** Creates a new note within a specific project.

**Parameters:**

- `projectId` (string, required) - The unique identifier of the project

**Request Body:**

```json
{
  "text": "Note text"
}
```

**Response:**

- **201 Created** - Note created successfully

```json
{
  "message": "Note has been added."
}
```

- **400 Bad Request** - Validation error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": "Note title is required",
    "content": "Note content is required"
  }
}
```

- **404 Not Found** - Project not found

```json
{
  "success": false,
  "error": "Project not found",
  "projectId": "invalid-project-id"
}
```

#### `PATCH /notes/:id`

**Description:** Updaye a note within a specific project.

**Parameters:**

- `id` (string, required) - The unique identifier of the note

**Request Body:**

```json
{
  "text": "Note text"
}
```

**Response:**

- **201 Created** - Note created successfully

```json
{
  "message": "Note has been updated."
}
```

- **404 Not Found** - Note not found

```json
{
  "error": "Note not found"
}
```

## Data Model

**Database Tables:**

```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
);

-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_notes_project_created ON notes(project_id, created_at DESC);
```

## Summary Endpoint

**Approach:** The summary endpoint (`GET /api/v1/projects/:id/notes/summary`) generates intelligent summaries of project notes.

**LLM Strategy:** Feed the most recent N notes based on size limit (e.g., ~4000 tokens for GPT-3.5, ~8000 for GPT-4) to ensure comprehensive context while staying within model limits.

**Latency Optimization:** Cache summaries keyed by `project_id:latest_note_id` with TTL. When new notes are added, the cache key automatically changes, invalidating stale summaries while serving cached results for unchanged note sets.

## Concurrency Safeguard

**Version Field Strategy:** Add a `version` integer field to both `projects` and `notes` tables, incrementing on each update. For updates, require the current version in the request and use optimistic locking:

```sql
-- Update with version check
UPDATE notes
SET text = $1, version = version + 1
WHERE id = $2 AND version = $3;

-- If rowCount = 0, throw "Conflict: Resource was modified by another user"
```

## Authentication (Future Enhancement)

To prevent cross-project data access, implement JWT-based authentication with project-scoped permissions. Each user token would contain authorized project IDs, and middleware would validate access before executing queries. This ensures users can only read/write notes within their authorized projects, preventing unauthorized cross-project data exposure.

## Time Tracking

- **Setup**
  - Set up the project and install dependencies. - Thrusday spent: 20m
- **Development and Testing**
  - Configure project structure and express server - Friday spent: 20m
  - Create types, schemas, utils, routes, and controllers - Friday spent: 1h
  - Implement project and note functionality (get projects, add project, get notes, add note, update note)
    get projects - Friday spent: 20m
    add project - Friday spent: 20m
    get notes - Friday spent: 20m
    add note - Friday spent: 20m
    update note - Saturday spent: 30m
  - Implement data validation and error handling - Friday spent: 1h
  - Implement caching for projects and notes - Friday spent: 1h
  - Enhanced functionality and error handling - Friday spent: 1h
  - Simultaneous testing - Friday spent: 2h
- **README**
  Create and Update README.md
  - Create docs - Friday spent: 1h
  - Update docs - Saturday spent: 1h
