# JAIT — Just Another Issue Tracker

## 1. Overview

**JAIT (Just Another Issue Tracker)** is a full-stack, multi-user issue and project management application.

The purpose of the project is not to compete with Jira. The purpose is to build a progressively sophisticated real-world backend while creating a portfolio project that can demonstrate practical software engineering ability.

The application allows users to:

- Create and manage projects
- Add other users to projects
- Create, assign, update, and close issues
- Organize issues by status, priority, and labels
- Comment on issues
- Search, filter, sort, and paginate issues
- Control what different users are allowed to do

The first release should remain intentionally small. Features should be added progressively as new backend concepts are learned.

---

# 2. Goals

### Primary goals

JAIT should demonstrate practical understanding of:

- HTTP and REST APIs
- Node.js
- Express
- PostgreSQL
- Relational database design
- Authentication
- Authorization
- Input validation
- Error handling
- API design
- Database queries and joins
- Transactions
- Pagination and filtering
- Testing
- Deployment
- Git and GitHub

### Secondary goals

As the project matures, it may demonstrate:

- Database indexing
- Performance optimization
- Caching
- Redis
- Background jobs
- Email/notifications
- WebSockets
- Rate limiting
- Logging and monitoring
- Docker
- CI/CD

These are **not part of the initial project**.

The project should grow only when there is a genuine reason to learn the next concept.

---

# 3. Core Philosophy

JAIT should follow one principle:

> **Build the simplest useful system first, then make it more sophisticated as new backend concepts are learned.**

The project must not become a giant specification that needs to be completed before deployment.

There will therefore be several versions.

```text
JAIT v0.1
    ↓
Basic CRUD application

JAIT v0.2
    ↓
Authentication + authorization

JAIT v0.3
    ↓
Better querying + filtering + pagination

JAIT v0.4
    ↓
Testing + security + production improvements

JAIT v1.x
    ↓
Advanced backend engineering
```

The first deployable version should be achievable quickly.

---

# 4. Technology Stack

## Frontend

The frontend technology can be whatever is already familiar.

Suggested:

- React
- TypeScript
- Vite
- A CSS framework or component library

The frontend is not the primary learning objective.

Do not spend excessive time making the UI visually impressive.

The UI should be clean, functional, and easy to demonstrate.

---

## Backend

Initial backend:

- Node.js
- Express
- JavaScript or TypeScript

Suggested eventual structure:

```text
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── db/
│   ├── utils/
│   └── app.js
├── tests/
├── package.json
└── ...
```

The exact architecture should evolve as the application becomes more complicated.

Do not introduce complicated patterns merely because they are considered "professional."

---

## Database

**PostgreSQL**

This project intentionally uses PostgreSQL rather than MongoDB because the domain contains naturally relational data.

The project should provide opportunities to practice:

- Primary keys
- Foreign keys
- Constraints
- JOINs
- Many-to-many relationships
- Aggregation
- Transactions
- Indexes
- Query optimization

---

# 5. Main Domain Model

The initial application revolves around five major entities.

```text
User
Project
ProjectMember
Issue
Comment
```

Additional entities can be introduced later.

---

# 6. User

A user represents an account in JAIT.

Possible fields:

```text
User
----
id
name
email
password_hash
created_at
updated_at
```

### Requirements

- Email must be unique.
- Passwords must never be stored in plaintext.
- The API should never return `password_hash`.
- A user must authenticate before accessing protected functionality.

---

# 7. Project

A project is a workspace containing issues.

Possible fields:

```text
Project
-------
id
name
description
owner_id
created_at
updated_at
```

Relationship:

```text
User 1 ──────── N Project
             owns
```

The project owner is the user who created the project.

---

# 8. Project Membership

Users can participate in projects.

This requires a many-to-many relationship.

```text
User N ───────── N Project
          │
          │
    ProjectMember
```

Possible fields:

```text
ProjectMember
-------------
project_id
user_id
role
joined_at
```

Possible roles:

```text
owner
member
```

Later, roles could become:

```text
owner
admin
member
```

The exact role system should remain small initially.

---

# 9. Issue

An issue represents a unit of work, bug, feature request, or task.

Possible fields:

```text
Issue
-----
id
project_id
title
description
status
priority
creator_id
assignee_id
created_at
updated_at
```

Suggested statuses:

```text
OPEN
IN_PROGRESS
RESOLVED
CLOSED
```

Suggested priorities:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Relationships:

```text
Project 1 ───── N Issue

User 1 ──────── N Issue
       creates

User 1 ──────── N Issue
       assigned to
```

An issue should belong to exactly one project.

---

# 10. Comment

Users can comment on issues.

Possible fields:

```text
Comment
-------
id
issue_id
author_id
body
created_at
updated_at
```

Relationships:

```text
Issue 1 ───── N Comment

User 1 ────── N Comment
```

This provides another useful relational structure for practicing JOINs.

---

# 11. Future Entity: Label

Labels should **not** be required for the first version.

Eventually:

```text
Issue N ───── N Label
```

through a junction table:

```text
IssueLabel
----------
issue_id
label_id
```

Example:

```text
bug
frontend
backend
database
urgent
feature
```

This is a useful future feature because it introduces another many-to-many relationship.

---

# 12. MVP

The first version should contain only enough functionality to form a coherent application.

## Authentication

```http
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

The exact authentication mechanism can be decided while implementing the feature.

---

## Projects

```http
GET    /projects
POST   /projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId
```

---

## Project Members

Initially:

```http
GET  /projects/:projectId/members
POST /projects/:projectId/members
```

Later:

```http
PATCH  /projects/:projectId/members/:userId
DELETE /projects/:projectId/members/:userId
```

---

## Issues

```http
GET    /projects/:projectId/issues
POST   /projects/:projectId/issues

GET    /issues/:issueId
PATCH  /issues/:issueId
DELETE /issues/:issueId
```

The project issue endpoint should eventually support filtering and pagination.

For example:

```http
GET /projects/12/issues?status=OPEN&priority=HIGH
```

---

## Comments

```http
GET  /issues/:issueId/comments
POST /issues/:issueId/comments

PATCH  /comments/:commentId
DELETE /comments/:commentId
```

---

# 13. Example User Flow

A typical user journey should look like:

```text
Register
   ↓
Login
   ↓
Dashboard
   ↓
Create Project
   ↓
Project Page
   ↓
Add project members
   ↓
Create Issue
   ↓
Assign Issue
   ↓
Change status
   ↓
Add Comment
   ↓
Filter Issues
```

This provides a complete end-to-end workflow.

---

# 14. Authorization Rules

Authentication answers:

> "Who are you?"

Authorization answers:

> "Are you allowed to do this?"

JAIT should explicitly demonstrate the difference.

Example:

A logged-in user may be able to:

- View projects they belong to
- View issues in those projects
- Create issues
- Comment on issues

But perhaps only the project owner/admin can:

- Delete the project
- Add or remove project members
- Modify project settings

And users should not be able to modify issues belonging to projects they do not have access to.

Authorization should be enforced by the **backend**, not merely hidden in the frontend.

---

# 15. API Design Principles

The API should use sensible HTTP semantics.

Examples:

```text
GET
    Retrieve resources

POST
    Create resources / perform actions where appropriate

PATCH
    Partially update a resource

DELETE
    Remove a resource
```

Responses should use meaningful HTTP status codes.

Examples:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

The purpose isn't to mechanically memorize status codes.

The API should communicate what actually happened.

---

# 16. Database Design

The database is one of the most important parts of JAIT.

An initial schema might resemble:

```text
users
-----
id PK
name
email UNIQUE
password_hash
created_at
updated_at


projects
--------
id PK
name
description
owner_id FK → users.id
created_at
updated_at


project_members
---------------
project_id FK → projects.id
user_id FK → users.id
role
joined_at

PRIMARY KEY (project_id, user_id)


issues
------
id PK
project_id FK → projects.id
title
description
status
priority
creator_id FK → users.id
assignee_id FK → users.id
created_at
updated_at


comments
--------
id PK
issue_id FK → issues.id
author_id FK → users.id
body
created_at
updated_at
```

The exact schema should evolve while building.

---

# 17. SQL Learning Opportunities

While implementing JAIT, deliberately practice SQL.

Examples:

### Retrieve all issues in a project

```sql
SELECT *
FROM issues
WHERE project_id = $1;
```

### Retrieve issues with their assignee

```sql
SELECT
    issues.*,
    users.name AS assignee_name
FROM issues
LEFT JOIN users
    ON issues.assignee_id = users.id
WHERE issues.project_id = $1;
```

### Retrieve comments with their authors

```sql
SELECT
    comments.*,
    users.name AS author_name
FROM comments
JOIN users
    ON comments.author_id = users.id
WHERE comments.issue_id = $1;
```

As the application grows, investigate:

- indexes
- query plans
- joins
- transactions
- constraints
- aggregation
- pagination strategies

---

# 18. Filtering and Pagination

The issue list should eventually support:

```text
status
priority
assignee
creator
search
sort order
page
page size
```

Example:

```http
GET /projects/12/issues
    ?status=OPEN
    &priority=HIGH
    &assignee=42
    &page=2
    &limit=20
```

This turns a basic CRUD API into something closer to a real application.

---

# 19. Error Handling

The backend should have centralized error handling.

Instead of every controller independently formatting errors, eventually use a consistent structure such as:

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project does not exist."
  }
}
```

The exact format is flexible.

The important property is **consistency**.

---

# 20. Input Validation

Every API endpoint that receives user-controlled input should validate it.

Examples:

```text
title cannot be empty
email must have valid format
priority must be one of the allowed values
projectId must be valid
pagination limits should have reasonable bounds
```

Validation should happen on the backend even if the frontend already validates the input.

---

# 21. Security

Security should be added progressively.

Important topics include:

- Password hashing
- Authentication
- Authorization
- SQL injection prevention
- Input validation
- Secure cookies, if cookies are used
- CORS configuration
- Rate limiting
- Sensitive-data handling
- Security headers

Do not attempt to solve every security concern on day one.

Learn each concept when it becomes relevant.

---

# 22. Testing

Testing should be introduced after the basic application works.

Useful layers:

```text
Unit tests
Integration tests
API / endpoint tests
```

Important scenarios include:

```text
User cannot access another project's issues.

Unauthenticated user cannot call protected endpoint.

Invalid issue data is rejected.

Non-member cannot modify project resources.

Deleting a resource behaves correctly.

Database errors are handled properly.
```

Testing should focus particularly on **business rules**, not just whether every function executes.

---

# 23. Deployment

JAIT should eventually be publicly accessible.

A simplified architecture may be:

```text
                 Internet
                     │
                     ▼
              Frontend Hosting
                     │
                     ▼
                 REST API
                     │
                     ▼
               Node / Express
                     │
                     ▼
               PostgreSQL
```

The actual hosting providers can be selected later.

The project should have:

- Production environment
- Environment variables
- Production database
- Secure secrets
- HTTPS
- README containing live links

---

# 24. Git and GitHub

The repository should reflect genuine development rather than being one enormous final commit.

Example progression:

```text
initial project setup
add Express server
add database connection
add project CRUD
add issue CRUD
add authentication
add authorization
add comments
add filtering
add tests
add deployment configuration
```

Commits should describe meaningful changes.

The README should explain:

- What JAIT is
- Why it exists
- Technology stack
- Architecture
- Setup instructions
- API overview
- Database design
- Authentication approach
- Live demo
- Screenshots

---

# 25. Development Phases

## Phase 0 — Setup

Learn:

- Node.js basics
- npm
- Express
- HTTP server
- routing
- middleware
- environment variables

Deliverable:

```text
A running Express application
```

---

## Phase 1 — Basic CRUD

Implement:

```text
Projects
Issues
```

Use PostgreSQL.

Learn:

- SQL
- database connections
- INSERT
- SELECT
- UPDATE
- DELETE
- JOINs
- foreign keys

Deliverable:

> A working issue tracker without authentication.

---

## Phase 2 — Authentication

Implement:

```text
register
login
logout
current user
```

Learn:

- password hashing
- authentication
- sessions/cookies or tokens
- protected routes

Deliverable:

> Multiple users can use JAIT.

---

## Phase 3 — Authorization

Implement project membership and permissions.

Learn:

- authorization
- roles
- resource ownership
- access control

Deliverable:

> Users can only perform actions they are permitted to perform.

---

## Phase 4 — Real Application Features

Implement:

- comments
- filtering
- sorting
- pagination
- search

Learn:

- query construction
- query parameters
- relational queries
- API design

Deliverable:

> JAIT becomes a genuinely usable application.

---

## Phase 5 — Production Quality

Add:

- validation
- centralized errors
- testing
- security improvements
- logging
- better database constraints

Learn:

> What changes when an application is expected to actually work reliably?

Deliverable:

> A portfolio-quality application.

---

## Phase 6 — Deployment

Deploy the application.

Learn:

- production configuration
- environment variables
- hosting
- databases in production
- build/deployment process
- debugging deployed applications

Deliverable:

> A public JAIT instance.

---

# 26. Advanced Extensions

These are explicitly optional.

Do **not** start here.

Potential future additions:

### Labels

```text
Issue N ↔ N Label
```

### Notifications

Notify users when:

- assigned an issue
- mentioned in a comment
- issue status changes

### Email

Send notifications asynchronously.

### Redis

Use Redis for:

- caching
- rate limiting
- sessions
- temporary data

### Background jobs

Instead of processing everything inside an HTTP request:

```text
HTTP Request
     ↓
Create Job
     ↓
Queue
     ↓
Worker
     ↓
Process task
```

### WebSockets

Real-time issue/comment updates.

### Activity history

Track events:

```text
Issue created
Issue assigned
Status changed
Comment added
Issue closed
```

Example:

```text
Activity
--------
id
issue_id
actor_id
action
metadata
created_at
```

### Docker

Containerize the application.

### CI/CD

Automatically:

```text
git push
   ↓
tests
   ↓
build
   ↓
deploy
```

---

# 27. What NOT to Build

JAIT should deliberately avoid unnecessary scope.

Do not initially build:

- Chat
- Video calls
- Calendar
- Complex permissions
- AI assistant
- Microservices
- Kubernetes
- elaborate notification systems
- complicated frontend animations
- dozens of issue types
- enterprise-level Jira features

The purpose is to understand backend engineering, not reproduce Jira.

---

# 28. Portfolio Positioning

JAIT should eventually demonstrate that the developer understands more than simply:

> "I can build a CRUD application."

The project should allow an interviewer to ask:

> Why PostgreSQL?

> How is authorization implemented?

> What happens when a user tries to access an issue from another project?

> How are many-to-many relationships represented?

> Why did you choose PATCH here?

> How does pagination work?

> What indexes would you add?

> How would this behave with 100,000 issues?

> What happens if two users update the same issue simultaneously?

> How would you add notifications without making the API request slow?

> How would you deploy this?

These questions are the real value of JAIT.

The project becomes a **conversation starter for backend knowledge**.

---

# 29. Initial Scope — The Version You Should Actually Build Now

For the first sprint, ignore almost everything above.

Build only:

```text
User
Project
Issue
```

with:

```text
Register
Login
Create project
View projects
Create issue
View issues
Update issue
Delete issue
```

Use:

```text
React
Node.js
Express
PostgreSQL
```

Deploy it.

That's it.

Then add the next feature.

The first objective is not:

> "Finish JAIT."

The first objective is:

> **"Get JAIT running in production."**

---

# 30. Definition of Done — First Resume Version

JAIT v0.1 is considered complete when:

- Users can create an account
- Users can log in
- Users can create projects
- Users can create issues
- Issues are persisted in PostgreSQL
- Issues can be updated and deleted
- The frontend communicates with the backend through a REST API
- The application is deployed
- The GitHub repository is presentable
- The README explains the project
- The developer can explain how every important piece works

At this point, **put it on the resume**.

Do not wait for labels, Redis, WebSockets, Docker, or anything else.

---

# 31. Long-Term Version

The eventual JAIT architecture may grow toward:

```text
                    ┌──────────────┐
                    │   Frontend   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   API Layer  │
                    │ Node/Express │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
       PostgreSQL        Redis        Job Queue
             │                           │
             │                           ▼
             │                         Worker
             │
             ▼
       Persistent Data
```

But this architecture should emerge from requirements.

**Do not build it simply because it looks impressive.**

---

# 32. Core Success Criterion

JAIT succeeds when the developer can honestly say:

> "I built this system myself, I understand why it works, I understand its limitations, and I can explain the tradeoffs behind its design."

That is far more valuable than saying:

> "I completed a 35-hour MERN course."

---

## Project Motto

> **Just Another Issue Tracker.**
>
> Simple enough to finish.
>
> Complex enough to learn from.
>
> Real enough to discuss in an interview.