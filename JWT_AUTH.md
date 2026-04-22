# JWT Authentication Setup

## Overview

This project now uses JWT (JSON Web Token) authentication to secure API endpoints. Users must log in to receive a token, which is then used to authenticate requests to protected endpoints.

## Backend Implementation

### New Components

1. **JWT Service** (`src/infrastructure/security/JwtService.ts`)
   - Generates JWT tokens for authenticated users
   - Verifies and decodes JWT tokens
   - Configurable secret key and expiration time
   - Uses HS512 algorithm for signing

2. **Login Use Case** (`src/application/user/usecases/LoginUser.ts`)
   - Validates user credentials
   - Returns JWT token upon successful authentication
   - Includes user information in response

3. **JWT Authentication Middleware** (`src/presentation/http/middlewares/jwtAuth.ts`)
   - Validates JWT tokens in Authorization header
   - Protects routes from unauthorized access
   - Attaches user information to request context

### Protected Routes

The following routes now require authentication:

- `POST /api/blogs` - Create a new blog post
- `DELETE /api/blogs/:slug` - Delete a blog post

### API Endpoints

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "user@example.com",
    "dateOfBirth": "1990-01-01",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### Register

```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "dateOfBirth": "1990-01-01",
  "password": "Password123"
}

Response (201 Created):
{
  "message": "Registration successful. You can now sign in.",
  "user": { ... }
}
```

#### Using Protected Endpoints

```
POST /api/blogs
Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "My Blog Post",
  "content": "This is the content...",
  "tags": ["tech", "programming"]
}
```

### Configuration

#### JWT Secret Key

Set the `JWT_SECRET` environment variable to use a custom secret key:

```bash
export JWT_SECRET="your-secure-secret-key"
deno run -A src/main.ts
```

If not set, a default key is used (change this in production!).

#### Token Expiration

Default: 24 hours

To change the expiration time, modify the `JwtService` instantiation in `src/main.ts`:

```typescript
const jwtService = new JwtService(undefined, 48); // 48 hours
```

## Frontend Implementation

### Authentication Flow

1. **Login**: User submits credentials via the login form
2. **Token Storage**: JWT token is stored in `localStorage` upon successful login
3. **Authenticated Requests**: Token is automatically included in requests to protected endpoints
4. **Redirect**: User is redirected to home page after successful login

### Updated Components

1. **Login Component** (`src/Components/Pages/Login/Login.tsx`)
   - Stores JWT token in localStorage
   - Redirects to home page after successful login
   - Shows appropriate error messages

2. **Blog Services** (`src/Services/blogServices.ts`)
   - Automatically includes JWT token in Authorization header
   - Handles 401 Unauthorized responses
   - Uses centralized API URL configuration

### Using the Auth Token

The token is automatically retrieved from localStorage and included in requests:

```typescript
// Example: Creating a blog post
const result = await createBlog({
  title: "My Post",
  content: "Content here",
  tags: ["tag1", "tag2"],
});

if (!result.success) {
  if (result.error?.includes("logged in")) {
    // User needs to log in
    navigate("/login");
  }
}
```

### Logout Implementation

To implement logout, simply remove the token from localStorage:

```typescript
const handleLogout = () => {
  localStorage.removeItem("authToken");
  navigate("/login");
};
```

## Security Considerations

1. **Secret Key**: Always use a strong, random secret key in production
2. **HTTPS**: Use HTTPS in production to protect tokens in transit
3. **Token Storage**: localStorage is used for simplicity; consider more secure alternatives for sensitive applications
4. **Token Expiration**: Tokens expire after 24 hours by default
5. **Password Requirements**: Passwords must be at least 5 characters with uppercase, lowercase, and numbers

## Testing

### Testing Authentication Locally

1. Start the backend:

```bash
cd random_blog_backend
deno task dev
```

2. Register a user:

```bash
curl -X POST http://localhost:4200/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-01",
    "password": "Password123"
  }'
```

3. Login to get a token:

```bash
curl -X POST http://localhost:4200/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

4. Use the token to create a blog post:

```bash
curl -X POST http://localhost:4200/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Post",
    "content": "This is a test",
    "tags": ["test"]
  }'
```

## Troubleshooting

### "Authorization token required"

- Ensure you're logged in and the token is stored in localStorage
- Check that the Authorization header is being sent with requests

### "Invalid or expired token"

- Token may have expired (24 hour default)
- Log in again to get a fresh token
- Verify JWT_SECRET matches between sessions

### CORS Issues

- Ensure the CORS middleware is properly configured
- Check that the Authorization header is allowed in CORS settings
