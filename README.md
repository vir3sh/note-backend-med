# Task Manager API

Node.js and Express REST API for the Task Manager application. It stores users and tasks in MongoDB through Mongoose and protects user-specific task routes with JSON Web Tokens.

## Requirements

- Node.js
- MongoDB, running locally or available through a MongoDB connection URI

## Setup

From this directory, install dependencies:

```bash
npm install
```

Configure the backend environment variables in a `.env` file:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGODB_URI` | No | `mongodb://localhost:27017/task-manager` | MongoDB connection string |
| `JWT_SECRET` | Yes | None | Secret used to sign and verify authentication tokens |
| `PORT` | No | `5000` | HTTP port for the API |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed frontend origin for CORS |

Start the API in development mode with automatic restarts:

```bash
npm run dev
```

Or start it normally:

```bash
npm start
```

The server connects to MongoDB before listening. By default, the API is available at `http://localhost:5000`. Check that it is responding with `GET /health`, which returns `{ "status": "ok" }`.

## Authentication

Sign up or log in to receive a bearer token. Include it on protected requests as:

```http
Authorization: Bearer <token>
```

Tokens expire after seven days. Every task endpoint requires authentication, and users can only access their own tasks.

## API

All request and response bodies use JSON, except for the `204 No Content` response from task deletion.

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/signup` | No | Create an account |
| `POST` | `/auth/login` | No | Log in |
| `GET` | `/auth/me` | Bearer token | Get the current user |
| `POST` | `/tasks` | Bearer token | Create a task |
| `GET` | `/tasks` | Bearer token | List the current user's tasks |
| `PATCH` | `/tasks/:id` | Bearer token | Change a task's status |
| `DELETE` | `/tasks/:id` | Bearer token | Delete a task |

### Account requests

Create an account with `POST /auth/signup`:

```json
{
	"name": "Alex",
	"email": "alex@example.com",
	"password": "at-least-6-characters"
}
```

Log in with `POST /auth/login`:

```json
{
	"email": "alex@example.com",
	"password": "at-least-6-characters"
}
```

Both endpoints return `data.user` and `data.token`. User responses do not include the password.

### Task requests

Create a task with `POST /tasks`:

```json
{
	"title": "Review project",
	"description": "Check the API and frontend"
}
```

The title is required and limited to 120 characters. The optional description is limited to 1,000 characters. New tasks start with `pending` status.

List tasks with `GET /tasks`. Optional query parameters are `status` (`pending` or `completed`), `page` (default `1`), and `limit` (default `10`, maximum `100`). The response includes `data`, an array of tasks, and `meta` pagination details.

Change a task's status with `PATCH /tasks/:id`:

```json
{
	"status": "completed"
}
```

The only accepted statuses are `pending` and `completed`. If the `status` field is omitted, the task is marked `completed`.

Task objects contain `id`, `title`, `description`, `status`, `createdAt`, and `updatedAt`.

## Errors

Errors are returned in this format:

```json
{
	"error": {
		"message": "A description of the error"
	}
}
```

Common status codes include `400` for invalid input, `401` for missing or invalid authentication, `404` when a route or task is not found, and `409` when an email address is already registered. Unexpected server errors return `500`.
