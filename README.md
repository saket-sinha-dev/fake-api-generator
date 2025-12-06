# Fake API Generator

A powerful, feature-rich mock API generator with resource management, data generation, and advanced querying capabilities.

## 🚀 Features

### 1. **Resource Schema Definition**
- Define custom resources with multiple fields
- Support for various data types: string, number, boolean, date, email, UUID, image, relation
- Configure data generators for each field using Faker.js
- Set up relations between resources
- Mark fields as required

### 2. **Automatic Endpoint Generation**
- Automatically generates RESTful endpoints for each resource:
  - `GET /api/v1/{resource}` - List all items (with pagination, filtering, sorting)
  - `GET /api/v1/{resource}/:id` - Get single item
  - `POST /api/v1/{resource}` - Create new item
  - `PUT /api/v1/{resource}/:id` - Update item
  - `DELETE /api/v1/{resource}/:id` - Delete item

### 3. **Advanced Query Parameters Support**
- **Pagination**: `?_page=1&_limit=10`
- **Sorting**: `?_sort=name&_order=asc` (or `desc`) - Supports multiple fields: `?_sort=age,name&_order=desc,asc`
- **Filtering**: `?fieldName=value` (supports partial string matching)
- **Comparison Operators**:
  - `?age_gte=18` - Greater than or equal
  - `?age_lte=65` - Less than or equal  
  - `?age_gt=18` - Greater than
  - `?age_lt=65` - Less than
  - `?age_ne=25` - Not equal
- **Full-text Search**: `?_search=keyword` - Searches across all fields
- **Embed Relations**: `?_embed=posts` - Include related child resources (e.g., user's posts)
- **Expand Relations**: `?_expand=user` - Include parent resource (e.g., post's user)

### 4. **Request Body Handling**
- POST requests accept JSON body to create new items
- PUT/PATCH requests accept JSON body to update items
- Automatic ID and timestamp generation

### 5. **Valid Status Codes**
- Dropdown with common HTTP status codes:
  - 200, 201, 204 (Success)
  - 400, 401, 403, 404, 409, 422 (Client errors)
  - 500, 502, 503 (Server errors)

### 6. **All HTTP Methods**
- GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD

### 7. **File Upload/Download** (Simulated)
- Image field type generates fake image URLs
- Can be extended for actual file handling

### 8. **Pagination**
- Built-in pagination with `_page` and `_limit` parameters
- Returns metadata: `{ data: [], pagination: { page, limit, total, totalPages } }`

### 9. **Sorting**
- Sort by any field using `_sort` parameter
- Control order with `_order=asc` or `_order=desc`

### 10. **Advanced Filtering**
- Filter by any field using query parameters
- String fields support partial matching (case-insensitive)
- Number fields support comparison operators (_gte, _lte, _gt, _lt, _ne)
- Boolean fields support exact matching
- Array fields support "contains" matching
- Full-text search across all fields with `_search` parameter

### 11. **Customizable Responses**
- Custom API tab for fully customizable endpoints
- Define your own path, method, status code, and response body
- Supports dynamic path parameters (e.g., `/users/:id`)

### 12. **Collaboration** (Foundation)
- JSON-based storage for easy sharing
- Persistent storage in MongoDB Atlas (cloud) or local MongoDB

### 13. **Custom Endpoints**
- Create completely custom APIs separate from resources
- Full control over response structure

### 14. **Webhooks**
- Configure webhook URLs for custom APIs
- Automatically triggers POST request to webhook URL when API is called

### 15. **User-Defined Paths**
- Full control over API paths
- Support for dynamic segments (`:id`, `:slug`, etc.)
- Path-to-regexp matching for flexible routing

## 📦 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
# Edit .env with your credentials
```

**Required environment variables:**
- `MONGODB_URI` - MongoDB connection string ([setup guide](./MONGODB_SETUP.md))
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - ([setup guide](./GOOGLE_AUTH_SETUP.md))

**Optional (for email features):**
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email service configuration
- `ADMIN_EMAIL` - Email for first admin user

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed setup instructions.

### 3. Initialize Admin User

```bash
npm run init-admin
```

This creates the first admin user and sends credentials via email (if configured).

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication

The app supports multiple authentication methods:

- **Google OAuth** - One-click sign in with Google
- **Email/Password** - Traditional signup and login
- **Admin System** - Role-based access control

**Sign up/Sign in:** `/auth/signin`

**Features:**
- Secure password hashing with bcryptjs
- Password reset via email
- Welcome emails for new users
- Admin credential generation
- Role management (user/admin)

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for complete authentication documentation.

## 📖 Usage Guide

### Creating a Resource

**⚠️ Important:** Resources are for simple, single-segment names like `users`, `products`, `devices`. 
For complex paths like `/devices/chart/assigned_dosimeters`, use **Custom APIs** instead.

1. Navigate to the **Resources** tab
2. Click **Create Resource**
3. Enter a resource name (plural, e.g., "users", "devices", "products")
   - ❌ Don't use: `devices/chart` (contains slash)
   - ✅ Use: `devices`
4. Add fields:
   - Field name (e.g., "firstName")
   - Data type (string, number, etc.)
   - For strings, optionally select a Faker method
   - For relations, select the related resource
   - Mark as required if needed
5. Click **Create Resource**
6. Click **Generate** to create fake data

### Example: Creating a "Users" Resource

```
Resource Name: users

Fields:
- firstName (string, Faker: person.firstName)
- lastName (string, Faker: person.lastName)
- email (email)
- age (number)
- avatar (image)
```

After generating 10 items, you can access:

```bash
# Get all users (paginated)
GET http://localhost:3000/api/v1/users?_page=1&_limit=5

# Get specific user
GET http://localhost:3000/api/v1/users/{id}

# Filter users
GET http://localhost:3000/api/v1/users?firstName=John

# Sort users
GET http://localhost:3000/api/v1/users?_sort=age&_order=desc

# Create user
POST http://localhost:3000/api/v1/users
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "age": 25
}

# Update user
PUT http://localhost:3000/api/v1/users/{id}
Content-Type: application/json

{
  "age": 26
}

# Delete user
DELETE http://localhost:3000/api/v1/users/{id}
```

### Creating a Custom API

1. Navigate to the **Custom APIs** tab
2. Click **Create New API**
3. Fill in:
   - **API Name** (Required)
   - **Path** (Required) - e.g., `/custom/endpoint` or `/users/:id`
   - **HTTP Method** - GET, POST, PUT, DELETE, PATCH, etc.
   - **Status Code** - 200, 201, 404, etc.
   - **Request Body** (Optional) - Expected request payload format for POST/PUT/PATCH
   - **Response Body** (Optional) - JSON response to return
   - **Query Parameters** (Optional) - Add parameter name, example value, and mark as required
   - **Webhook URL** (Optional)
4. Click **Create API**

**Example with Request Body and Query Parameters:**
- Path: `/devices/chart/assigned_dosimeters`
- Method: POST
- Request Body:
  ```json
  {
    "deviceId": "12345",
    "userId": "user-001"
  }
  ```
- Query Parameters:
  - Parameter: `account_id`, Value: `559`, Required: ✓
- Response Body:
  ```json
  {
    "success": true,
    "data": { "assigned": true }
  }
  ```
- Full URL: `/api/v1/devices/chart/assigned_dosimeters?account_id=559`

### Relations Between Resources

Create a "posts" resource with a relation to "users":

```
Resource Name: posts

Fields:
- title (string)
- content (string, Faker: lorem.paragraph)
- userId (relation, relationTo: users)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Custom Design System)
- **Icons**: Lucide React
- **Data Generation**: @faker-js/faker
- **Routing**: path-to-regexp
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js v5

## 📁 Project Structure

```
├── src/
│   ├── models/
│   │   └── index.ts       # Mongoose schemas (Projects, Resources, APIs, Database)
│   ├── lib/
│   │   ├── mongodb.ts     # Database connection
│   │   └── dataGenerator.ts  # Faker.js data generation
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── apis/      # Custom API management
│   │   │   ├── resources/ # Resource management
│   │   │   └── mock/      # Dynamic API handler
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ApiForm.tsx
│   │   ├── ApiList.tsx
│   │   ├── ResourceForm.tsx
│   │   └── ResourceList.tsx
│   ├── lib/
│   │   └── dataGenerator.ts
│   └── types.ts
```

## 🎨 Features in Detail

### Data Generators

Available Faker methods for string fields:
- First Name, Last Name, Full Name
- Email, Username
- Phone Number
- Address, City, Country
- Company Name, Job Title
- Product Name, Price, Description
- Lorem Sentence, Lorem Paragraph
- Color
- Random Number

### Status Codes

Predefined valid HTTP status codes ensure proper API behavior simulation.

### Pagination Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Query Parameters Guide

#### Basic Filtering
```bash
# Filter by exact field value
GET /api/v1/users?role=admin

# String partial match (case-insensitive)
GET /api/v1/users?name=john

# Multiple filters (AND operation)
GET /api/v1/users?role=admin&status=active
```

#### Comparison Operators
```bash
# Greater than or equal
GET /api/v1/users?age_gte=18

# Less than or equal
GET /api/v1/products?price_lte=100

# Greater than
GET /api/v1/users?age_gt=18

# Less than
GET /api/v1/products?price_lt=100

# Not equal
GET /api/v1/users?status_ne=inactive

# Combine operators
GET /api/v1/products?price_gte=50&price_lte=200
```

#### Full-Text Search
```bash
# Search across all fields
GET /api/v1/users?_search=john

# Combine with filters
GET /api/v1/users?_search=developer&status=active
```

#### Sorting
```bash
# Sort by single field (ascending)
GET /api/v1/users?_sort=name

# Sort descending
GET /api/v1/users?_sort=age&_order=desc

# Sort by multiple fields
GET /api/v1/users?_sort=age,name&_order=desc,asc
```

#### Pagination
```bash
# Get first page (10 items)
GET /api/v1/users?_page=1&_limit=10

# Get second page (20 items per page)
GET /api/v1/users?_page=2&_limit=20

# Combine with filters and sorting
GET /api/v1/users?role=admin&_sort=createdAt&_order=desc&_page=1&_limit=5
```

#### Relations

**Embed**: Include child resources (one-to-many)
```bash
# Get users with their posts embedded
GET /api/v1/users?_embed=posts

# Response:
{
  "data": [
    {
      "id": "1",
      "name": "John",
      "posts": [
        { "id": "1", "title": "Post 1", "userId": "1" },
        { "id": "2", "title": "Post 2", "userId": "1" }
      ]
    }
  ]
}
```

**Expand**: Include parent resource (many-to-one)
```bash
# Get posts with user data expanded
GET /api/v1/posts?_expand=user

# Response:
{
  "data": [
    {
      "id": "1",
      "title": "Post 1",
      "userId": "1",
      "user": { "id": "1", "name": "John" }
    }
  ]
}
```

#### Complex Query Examples
```bash
# Active users aged 18-65, sorted by name, page 1
GET /api/v1/users?status=active&age_gte=18&age_lte=65&_sort=name&_page=1&_limit=20

# Products under $100 with "phone" in name, sorted by price
GET /api/v1/products?price_lt=100&name=phone&_sort=price&_order=asc

# Search for "developer" in all fields, active status only
GET /api/v1/users?_search=developer&status=active&_sort=createdAt&_order=desc
```

## 🔮 Future Enhancements

- Real-time collaboration with WebSockets
- Export/Import API collections
- API documentation generation
- Request/Response logging
- Authentication simulation
- Rate limiting simulation
- GraphQL support
- File upload handling
- Database persistence (PostgreSQL/MongoDB)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.
