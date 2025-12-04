# Fake API Generator

A powerful, feature-rich mock API generator with resource management, data generation, and advanced querying capabilities. Inspired by tools like Mocki.io and MockAPI.io.

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

### 3. **Query Parameters Support**
- **Pagination**: `?_page=1&_limit=10`
- **Sorting**: `?_sort=name&_order=asc` (or `desc`)
- **Filtering**: `?fieldName=value` (supports partial string matching)

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

### 10. **Filtering**
- Filter by any field using query parameters
- String fields support partial matching (case-insensitive)

### 11. **Customizable Responses**
- Custom API tab for fully customizable endpoints
- Define your own path, method, status code, and response body
- Supports dynamic path parameters (e.g., `/users/:id`)

### 12. **Collaboration** (Foundation)
- JSON-based storage for easy sharing
- Export/import capabilities (via file system)

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

## 📦 Installation

```bash
npm install
```

## 🏃 Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### Creating a Resource

1. Navigate to the **Resources** tab
2. Click **Create Resource**
3. Enter a resource name (plural, e.g., "users")
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
   - API Name
   - Path (e.g., `/custom/endpoint` or `/users/:id`)
   - HTTP Method
   - Status Code
   - Response Body (JSON)
   - (Optional) Webhook URL
4. Click **Create API**

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
- **Storage**: Local JSON files

## 📁 Project Structure

```
├── data/
│   ├── apis.json          # Custom API definitions
│   ├── resources.json     # Resource schemas
│   └── database.json      # Generated data
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
