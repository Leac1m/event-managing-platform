# API Reference

Complete API documentation for the Event Managing Platform.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.eventmanagingplatform.com` (or your domain)

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

Tokens are obtained through the login endpoint.

---

## Authentication Endpoints

### Register User

Register a new user account with profile photo upload.

**Endpoint**: `POST /api/auth/register`

**Content-Type**: `multipart/form-data`

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username (3+ chars) |
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 characters |
| firstName | string | Yes | User's first name |
| lastName | string | Yes | User's last name |
| gender | string | Yes | `Male`, `Female`, or `Other` |
| department | string | Yes | Department/organization |
| profileImage | File | Yes | JPEG/PNG/WebP, max 500KB |

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -F "username=john_doe" \
  -F "email=john@example.com" \
  -F "password=SecurePassword123!" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "gender=Male" \
  -F "department=Engineering" \
  -F "profileImage=@profile.jpg"
```

**Success Response (201)**:
```json
{
  "success": true,
  "user": {
    "id": "usr_123abc",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileUrl": "/uploads/profiles/usr_123abc/1234567890-profile.webp"
  }
}
```

**Error Response (400)**:
```json
{
  "error": "Username already exists"
}
```

**Error Response (413)**:
```json
{
  "error": "File size exceeds 500KB limit"
}
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePassword123!"
  }'
```

**Success Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123abc",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profileUrl": "/uploads/profiles/usr_123abc/1234567890-profile.webp"
  }
}
```

**Error Response (401)**:
```json
{
  "error": "Invalid username or password"
}
```

---

### Send Verification Email

Send email verification link to user.

**Endpoint**: `POST /api/auth/send-verification` (tRPC)

**Authentication**: Required

**Example**:
```typescript
const result = await trpc.sendVerificationEmail.mutate();
```

**Success Response**:
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

### Verify Email

Verify user's email with token from email link.

**Endpoint**: `POST /api/auth/verify-email` (tRPC)

**Authentication**: Not required

**Request Body**:
```typescript
{
  token: string  // Token from email link
}
```

**Example**:
```typescript
await trpc.verifyEmail.mutate({ token: "token_from_email" });
```

---

## Event Endpoints (via tRPC)

### Create Event

Create a new event (organizer only).

**Procedure**: `trpc.createEvent.mutate()`

**Authentication**: Required

**Input**:
```typescript
{
  name: string;           // Event name
  description: string;    // Event description
  location?: string;      // Event location
  startTime: Date;        // Start time
  endTime: Date;          // End time
  type: 'open' | 'private';
  passcode?: string;      // Required if type is 'private'
}
```

**Example**:
```typescript
const event = await trpc.createEvent.mutate({
  name: 'Tech Conference 2026',
  description: 'Annual tech conference',
  location: 'Convention Center',
  startTime: new Date('2026-06-01T09:00:00Z'),
  endTime: new Date('2026-06-01T17:00:00Z'),
  type: 'open'
});
```

**Response**:
```typescript
{
  id: 'evt_123abc',
  name: 'Tech Conference 2026',
  description: 'Annual tech conference',
  location: 'Convention Center',
  startTime: 2026-06-01T09:00:00.000Z,
  endTime: 2026-06-01T17:00:00.000Z,
  type: 'open',
  status: 'published',
  createdAt: 2026-05-13T10:30:00.000Z
}
```

---

### Get Events

Retrieve all events (with filtering options).

**Procedure**: `trpc.getEvents.query()`

**Authentication**: Not required

**Response**:
```typescript
[
  {
    id: 'evt_123abc',
    name: 'Tech Conference 2026',
    description: 'Annual tech conference',
    location: 'Convention Center',
    startTime: 2026-06-01T09:00:00.000Z,
    endTime: 2026-06-01T17:00:00.000Z,
    type: 'open',
    status: 'published',
    createdAt: 2026-05-13T10:30:00.000Z
  }
  // ... more events
]
```

---

### Update Event

Update event details (creator/organizer only).

**Procedure**: `trpc.updateEvent.mutate()`

**Authentication**: Required

**Input**:
```typescript
{
  id: string;
  name?: string;
  description?: string;
  location?: string;
  startTime?: Date;
  endTime?: Date;
  type?: 'open' | 'private';
  passcode?: string;
}
```

---

### Delete Event

Delete an event (creator only).

**Procedure**: `trpc.deleteEvent.mutate()`

**Authentication**: Required

**Input**:
```typescript
{
  id: string;  // Event ID
}
```

---

### Get Event Details

Get full details of a specific event.

**Procedure**: `trpc.getEventById.query()`

**Authentication**: Not required

**Input**:
```typescript
{
  id: string;  // Event ID
}
```

---

## Attendance Endpoints

### Scan QR Code

Scan and verify QR code for attendance.

**Procedure**: `trpc.scanQR.mutate()`

**Authentication**: Required (organizer/creator only)

**Input**:
```typescript
{
  eventId: string;  // Event ID
  token: string;    // QR token
}
```

**Success Response**:
```typescript
{
  success: true,
  user: {
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    department: 'Engineering',
    matricNumber: 'ENG001',
    profileUrl: '/uploads/profiles/usr_123/profile.webp'
  }
}
```

**Error Response**:
```typescript
{
  error: 'User is not registered for this event'
}
```

---

### Get Attendance Records

Get all attendance records for an event.

**Procedure**: `trpc.getAttendance.query()`

**Authentication**: Required (organizer/creator only)

**Input**:
```typescript
{
  eventId: string;  // Event ID
}
```

**Response**:
```typescript
[
  {
    id: 'att_123',
    userId: 'usr_456',
    eventId: 'evt_123',
    scannedAt: 2026-05-13T09:15:00.000Z,
    user: {
      username: 'john_doe',
      firstName: 'John',
      lastName: 'Doe',
      profileUrl: '/uploads/profiles/...'
    }
  }
  // ... more records
]
```

---

## User Endpoints

### Get Current User

Get authenticated user's information.

**Procedure**: `trpc.me.query()`

**Authentication**: Required

**Response**:
```typescript
{
  id: 'usr_123abc',
  username: 'john_doe',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  gender: 'Male',
  department: 'Engineering',
  profileUrl: '/uploads/profiles/usr_123abc/...',
  emailVerified: true,
  createdAt: 2026-05-13T10:30:00.000Z
}
```

---

### Update User Profile

Update user information.

**Procedure**: `trpc.updateProfile.mutate()`

**Authentication**: Required

**Input**:
```typescript
{
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
}
```

---

## Error Handling

All API errors follow this format:

```typescript
{
  error: {
    message: string;      // Human-readable error message
    code: string;         // Error code for handling
    httpStatus: number;   // HTTP status code
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks permissions for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists (e.g., duplicate email) |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Rate Limiting

Rate limits apply to all endpoints:

- **Authentication endpoints**: 10 requests per minute per IP
- **Other endpoints**: 100 requests per minute per user
- **File uploads**: 5 uploads per minute per user

Rate limit info is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1663899600
```

---

## Pagination

List endpoints support pagination:

```typescript
{
  page?: number;      // Page number (default: 1)
  limit?: number;     // Items per page (default: 20, max: 100)
  sort?: string;      // Sort field
  order?: 'asc' | 'desc';  // Sort order
}
```

Response format:

```typescript
{
  data: Array<T>;
  total: number;      // Total items
  page: number;
  pages: number;      // Total pages
}
```

---

## Versioning

Current API version: **v1**

The API uses date-based versioning. Breaking changes will increment the version number.

---

## Webhooks

*(Planned for v1.1.0)*

Subscribe to event changes via webhooks.

---

## Support

For API questions or issues:

- 📖 Full documentation: Check [README.md](../README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/yourusername/event-managing-platform/issues)
- 💬 Ask questions: [GitHub Discussions](https://github.com/yourusername/event-managing-platform/discussions)
