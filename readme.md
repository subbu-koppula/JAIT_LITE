# JAIT — Just Another Issue Tracker

## 1. Overview

**JAIT (Just Another Issue Tracker)** is a full-stack, multi-user issue and project management application.

The purpose of the project is not to compete with Jira. The purpose is to build a minimalistic Project management appication that does all the esssential tasks, without needs any unnecessary features in the name of convinience. 


The application allows users to:

- Create and manage projects
- Add other users to projects
- Create, assign, update, and close issues
- Organize issues by status, priority, and labels
- Comment on issues
- Search, filter, sort, and paginate issues
- Control what different users are allowed to do

The first release should remain intentionally small. Features will be added progressively as new backend concepts are learned.

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


# 3. Core Philosophy

JAIT should follow one principle:

> **Build the simplest useful system based on user-needs without making it bloated with unncessary features.**

The project must not become a giant specification.

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
---

# 4. Technology Stack

## Frontend

- React
- Vite
- A CSS framework or component library

The UI is clean, functional, and easy to demonstrate.

---

## Backend

Initial backend:

- Node.js
- Express
- JavaScript or TypeScript

eventual structure:

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


---
