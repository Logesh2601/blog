# BlogSpace — Full-Stack Blog Platform

A full-stack blog platform built with Node.js/Express on the backend and plain HTML/CSS/JS on the frontend.

## Features

- **Authentication** — Register and login with JWT tokens (7-day expiry)
- **Posts** — Create, read, update, and delete blog posts
- **Comments** — Add and delete comments on posts
- **Authorization** — Users can only edit/delete their own posts and comments
- **Responsive design** — Clean blue/white design that works on all screen sizes

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Node.js, Express                  |
| Database | SQLite via `better-sqlite3`       |
| Auth     | JWT (`jsonwebtoken`) + `bcryptjs` |
| Frontend | HTML, CSS, Vanilla JavaScript     |

## Project Structure

```
blog-platform/
├── backend/
│   ├── server.js           # Express app entry point
│   ├── package.json
│   ├── db/
│   │   └── database.js     # SQLite setup & schema
│   ├── routes/
│   │   ├── auth.js         # /api/auth/register, /api/auth/login
│   │   ├── posts.js        # /api/posts CRUD + comments
│   │   └── comments.js     # /api/comments/:id DELETE
│   └── middleware/
│       └── auth.js         # JWT authentication middleware
└── frontend/
    ├── index.html          # Homepage — all posts
    ├── login.html          # Login form
    ├── register.html       # Registration form
    ├── post.html           # Single post + comments
    ├── create-post.html    # Create new post
    ├── edit-post.html      # Edit existing post
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js          # Centralized API helper (BASE_URL: http://localhost:3000)
        ├── auth.js         # Auth utilities, nav rendering, shared helpers
        ├── index.js        # Homepage post listing
        ├── post.js         # Single post view + comments logic
        └── create-post.js  # Create/Edit post form logic
```

## Getting Started

### 1. Install & run the backend

```bash
cd backend
npm install
npm start
```

The server starts at **http://localhost:3000**.

### 2. Open the frontend

Open your browser and navigate to **http://localhost:3000**

> The Express server also serves the frontend as static files, so opening `http://localhost:3000` loads the homepage directly.
>
> Alternatively, you can open `frontend/index.html` directly in your browser — but note that API calls will still require the backend to be running at `http://localhost:3000`.

## API Endpoints

### Auth
| Method | Endpoint              | Description        | Auth |
|--------|-----------------------|--------------------|------|
| POST   | /api/auth/register    | Register new user  | No   |
| POST   | /api/auth/login       | Login              | No   |

### Posts
| Method | Endpoint              | Description              | Auth     |
|--------|-----------------------|--------------------------|----------|
| GET    | /api/posts            | Get all posts            | No       |
| GET    | /api/posts/:id        | Get single post + comments | No     |
| POST   | /api/posts            | Create post              | Required |
| PUT    | /api/posts/:id        | Update post (own only)   | Required |
| DELETE | /api/posts/:id        | Delete post (own only)   | Required |

### Comments
| Method | Endpoint                    | Description                  | Auth     |
|--------|-----------------------------|------------------------------|----------|
| GET    | /api/posts/:id/comments     | Get comments for post        | No       |
| POST   | /api/posts/:id/comments     | Add comment                  | Required |
| DELETE | /api/comments/:id           | Delete comment (own only)    | Required |

## Authentication

JWT tokens are sent in the `Authorization` header as `Bearer <token>` and stored in `localStorage`.

## Development

To use hot-reload during development:

```bash
cd backend
npm install -g nodemon   # if not installed
npm run dev
```

## Notes

- The SQLite database file is created automatically at `backend/db/blog.db` on first run.
- The JWT secret is hardcoded as `blog_jwt_secret_2024` — change this for any real deployment.
- CORS is enabled for all origins.
