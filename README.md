# RandomBlog Backend (Deno + TypeScript)

A clean-architecture-ish REST API for storing and returning blog posts (in-memory repository for now).

## Run

```bash
deno task dev
```

Server defaults to: `http://localhost:8000`

## Endpoints

- `GET /health`
- `GET /api/blogs` (optional query `?q=` to search title/content)
- `GET /api/blogs/:slug`
- `POST /api/blogs`
  - JSON body: `{ "title": "My Post", "content": "Hello", "tags": ["deno"] }`

## Notes

- CORS is enabled for local dev (allows your React app to call this API).
- Data is stored in-memory; restarting the server resets the list.
