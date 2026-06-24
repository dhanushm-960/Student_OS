# StudentOS Auth API Documentation

This backend service implements a complete role-based authentication system supporting **Student** and **Admin** users.

---

## 🚀 Endpoints

### 1. Student Registration
- **URL**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new user. Role defaults to `"student"`. Returns a signed JWT.
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex.mercer@university.edu",
    "password": "securepassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "603d7b88df1c3f25c8cf112a",
      "name": "Alex Mercer",
      "email": "alex.mercer@university.edu",
      "role": "student"
    }
  }
  ```

---

### 2. User Login
- **URL**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates existing user. Returns JWT and user context.
- **Request Body**:
  ```json
  {
    "email": "alex.mercer@university.edu",
    "password": "securepassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "603d7b88df1c3f25c8cf112a",
      "name": "Alex Mercer",
      "role": "student",
      "email": "alex.mercer@university.edu"
    }
  }
  ```

---

### 3. Get Current User Profile
- **URL**: `GET /api/auth/me`
- **Access**: Private (Requires Authorization Header)
- **Description**: Reads JWT token from authorization header, decodes, and returns user context.
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "603d7b88df1c3f25c8cf112a",
      "name": "Alex Mercer",
      "email": "alex.mercer@university.edu",
      "role": "student",
      "createdAt": "2026-06-22T04:15:00.000Z",
      "updatedAt": "2026-06-22T04:15:00.000Z"
    }
  }
  ```

---

## 🛠️ Middleware

### 1. `authMiddleware.js` (JWT Authentication)
- Decodes and verifies incoming tokens via `jsonwebtoken`.
- Queries the MongoDB User model using the token's ID payload.
- Attaches the parsed document (excluding password) to `req.user`.

### 2. `adminMiddleware.js` (Admin Access Protection)
- Can be placed sequentially after `authMiddleware.js` on admin routes.
- Evaluates `req.user.role === 'admin'`. If false, intercepts with a `403 Forbidden` response.

---

## 📁 Postman Collections
To verify endpoints using Postman:
1. Locate the file [StudentOS_Auth_API.postman_collection.json](file:///c:/Users/Dhanush.m/OneDrive/Documents/Student_OS%201/Student_OS/backend/StudentOS_Auth_API.postman_collection.json) in your filesystem.
2. In Postman, click **Import** in the top left and select this file.
3. Once imported, copy the `token` received from registration or login, and set it as the value of the `JWT_TOKEN` collection variable to test the `/api/auth/me` protected profile path.
