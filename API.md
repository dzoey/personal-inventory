# API Documentation

Complete API reference for the Personal Inventory Management System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "auth_provider": "local",
    "profile_picture": null
  }
}
```

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "auth_provider": "local",
    "profile_picture": null
  }
}
```

### Google OAuth

Initiate Google Sign-In flow.

**Endpoint:** `GET /auth/google`

**Authentication:** Not required

Redirects to Google consent screen.

### Get Current User

Get authenticated user information.

**Endpoint:** `GET /auth/me`

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "auth_provider": "local",
    "profile_picture": null
  }
}
```

---

## Items Endpoints

### List All Items

Get all items with optional filtering.

**Endpoint:** `GET /items`

**Authentication:** Required

**Query Parameters:**
- `search` (optional): Search in name, description, or barcode
- `category_id` (optional): Filter by category
- `container_id` (optional): Filter by container
- `location_id` (optional): Filter by location

**Example:**
```
GET /items?search=laptop&category_id=1
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "MacBook Pro",
      "description": "2023 model",
      "quantity": 1,
      "category_id": 1,
      "category_name": "Electronics",
      "container_id": null,
      "container_name": null,
      "location_id": 2,
      "location_name": "Office",
      "barcode": "123456789012",
      "barcode_type": "EAN-13",
      "image_path": "/uploads/laptop-123.jpg",
      "ai_identified": true,
      "ai_confidence": 95,
      "created_at": "2026-01-01T12:00:00.000Z",
      "updated_at": "2026-01-01T12:00:00.000Z"
    }
  ]
}
```

### Get Single Item

Get detailed information about a specific item.

**Endpoint:** `GET /items/:id`

**Authentication:** Required

**Response:**
```json
{
  "item": {
    "id": 1,
    "name": "MacBook Pro",
    "description": "2023 model",
    "quantity": 1,
    "category_name": "Electronics",
    "container_name": null,
    "location_name": "Office",
    "barcode": "123456789012",
    "image_path": "/uploads/laptop-123.jpg"
  }
}
```

### Create Item

Add a new item to inventory.

**Endpoint:** `POST /items`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (required): Item name
- `description` (optional): Item description
- `quantity` (optional): Quantity (default: 1)
- `category_id` (optional): Category ID
- `container_id` (optional): Container ID
- `location_id` (optional): Location ID
- `barcode` (optional): Barcode value
- `barcode_type` (optional): Barcode type
- `image` (optional): Image file

**Response:**
```json
{
  "message": "Item created successfully",
  "item": {
    "id": 1,
    "name": "MacBook Pro",
    "description": "2023 model",
    "quantity": 1,
    "category_id": 1,
    "container_id": null,
    "location_id": 2,
    "barcode": "123456789012",
    "barcode_type": "EAN-13",
    "image_path": "/uploads/laptop-123.jpg",
    "ai_identified": false,
    "ai_confidence": null,
    "created_at": "2026-01-01T12:00:00.000Z",
    "updated_at": "2026-01-01T12:00:00.000Z"
  }
}
```

### Update Item

Update an existing item.

**Endpoint:** `PUT /items/:id`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:** Same as Create Item (all optional)

**Response:**
```json
{
  "message": "Item updated successfully",
  "item": { ... }
}
```

### Delete Item

Remove an item from inventory.

**Endpoint:** `DELETE /items/:id`

**Authentication:** Required

**Response:**
```json
{
  "message": "Item deleted successfully"
}
```

### Find Item by Barcode

Search for an item using its barcode.

**Endpoint:** `GET /items/barcode/:barcode`

**Authentication:** Required

**Response:**
```json
{
  "item": { ... }
}
```

---

## Categories Endpoints

### List All Categories

Get all categories with item counts.

**Endpoint:** `GET /categories`

**Authentication:** Required

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices",
      "created_at": "2026-01-01T12:00:00.000Z",
      "item_count": 5
    }
  ]
}
```

### Get Single Category

Get category with all its items.

**Endpoint:** `GET /categories/:id`

**Authentication:** Required

**Response:**
```json
{
  "category": {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic devices",
    "created_at": "2026-01-01T12:00:00.000Z",
    "items": [...]
  }
}
```

### Create Category

Add a new category.

**Endpoint:** `POST /categories`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

**Response:**
```json
{
  "message": "Category created successfully",
  "category": {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "created_at": "2026-01-01T12:00:00.000Z"
  }
}
```

### Update Category

Update an existing category.

**Endpoint:** `PUT /categories/:id`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Category

Remove a category (only if it has no items).

**Endpoint:** `DELETE /categories/:id`

**Authentication:** Required

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

---

## Locations Endpoints

### List All Locations

Get all locations in tree structure.

**Endpoint:** `GET /locations`

**Authentication:** Required

**Query Parameters:**
- `flat` (optional): Set to "true" for flat list instead of tree

**Response (Tree):**
```json
{
  "locations": [
    {
      "id": 1,
      "name": "Home",
      "description": "Main house",
      "parent_location_id": null,
      "image_path": null,
      "container_count": 2,
      "item_count": 5,
      "children": [
        {
          "id": 2,
          "name": "Office",
          "parent_location_id": 1,
          "children": []
        }
      ]
    }
  ]
}
```

### Get Single Location

Get location with all contents.

**Endpoint:** `GET /locations/:id`

**Authentication:** Required

**Response:**
```json
{
  "location": {
    "id": 2,
    "name": "Office",
    "description": "Home office",
    "parent_location_id": 1,
    "image_path": "/uploads/office.jpg",
    "parent": {
      "id": 1,
      "name": "Home"
    },
    "children": [],
    "containers": [...],
    "items": [...]
  }
}
```

### Create Location

Add a new location.

**Endpoint:** `POST /locations`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (required): Location name
- `description` (optional): Description
- `parent_location_id` (optional): Parent location ID
- `image` (optional): Image file

### Update Location

Update an existing location.

**Endpoint:** `PUT /locations/:id`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

### Delete Location

Remove a location (only if empty).

**Endpoint:** `DELETE /locations/:id`

**Authentication:** Required

---

## Containers Endpoints

### List All Containers

Get all containers.

**Endpoint:** `GET /containers`

**Authentication:** Required

**Query Parameters:**
- `location_id` (optional): Filter by location
- `flat` (optional): Set to "true" for flat list

**Response:**
```json
{
  "containers": [
    {
      "id": 1,
      "name": "Storage Box A",
      "description": "Large plastic box",
      "location_id": 2,
      "location_name": "Office",
      "parent_container_id": null,
      "barcode": "BOX001",
      "barcode_type": "Code-39",
      "image_path": "/uploads/box.jpg",
      "item_count": 3,
      "child_count": 0
    }
  ]
}
```

### Get Single Container

Get container with all contents.

**Endpoint:** `GET /containers/:id`

**Authentication:** Required

### Create Container

Add a new container.

**Endpoint:** `POST /containers`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (required): Container name
- `description` (optional): Description
- `location_id` (optional): Location ID
- `parent_container_id` (optional): Parent container ID
- `barcode` (optional): Barcode value
- `barcode_type` (optional): Barcode type
- `image` (optional): Image file

### Update Container

Update an existing container.

**Endpoint:** `PUT /containers/:id`

**Authentication:** Required

### Delete Container

Remove a container (only if empty).

**Endpoint:** `DELETE /containers/:id`

**Authentication:** Required

### Find Container by Barcode

Search for a container using its barcode.

**Endpoint:** `GET /containers/barcode/:barcode`

**Authentication:** Required

---

## AI Endpoints

### Identify Item

Use AI to identify an item from image, text, or barcode.

**Endpoint:** `POST /ai/identify-item`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `description` (optional): Text description
- `barcode` (optional): Barcode value
- `image` (optional): Image file

**Response:**
```json
{
  "success": true,
  "item": {
    "name": "Apple MacBook Pro",
    "description": "Laptop computer with M2 chip",
    "category": "Electronics",
    "brand": "Apple",
    "confidence": 95,
    "ai_identified": true,
    "image_path": "/uploads/item-123.jpg",
    "barcode": "123456789012",
    "barcode_type": "EAN-13"
  },
  "vision_data": {
    "labels": [...],
    "objects": [...],
    "text": "...",
    "logos": [...]
  },
  "barcode_data": {...}
}
```

### Suggest Placement

Get AI suggestion for where to store an item.

**Endpoint:** `POST /ai/suggest-placement`

**Authentication:** Required

**Request Body:**
```json
{
  "item_name": "Screwdriver Set",
  "item_description": "Phillips and flathead screwdrivers",
  "item_category": "Tools"
}
```

**Response:**
```json
{
  "success": true,
  "suggestion": {
    "location_id": 3,
    "container_id": 5,
    "reasoning": "Tools are best stored in the garage toolbox for easy access and organization.",
    "alternatives": [
      "Basement storage",
      "Workshop shelf"
    ]
  },
  "available_locations": [...],
  "available_containers": [...]
}
```

### Natural Language Query

Ask questions about your inventory.

**Endpoint:** `POST /ai/query`

**Authentication:** Required

**Request Body:**
```json
{
  "query": "Where did I put my laptop charger?"
}
```

**Response:**
```json
{
  "success": true,
  "query": "Where did I put my laptop charger?",
  "answer": "Based on your inventory, your laptop charger is stored in the Office desk drawer.",
  "confidence": 80,
  "context": {
    "total_items": 45,
    "total_categories": 8,
    "total_locations": 5
  }
}
```

### Analyze Image

Analyze an image without creating an item.

**Endpoint:** `POST /ai/analyze-image`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (required): Image file

**Response:**
```json
{
  "success": true,
  "analysis": {
    "labels": [
      {"description": "Laptop", "confidence": 98},
      {"description": "Computer", "confidence": 95}
    ],
    "objects": [
      {"name": "Laptop computer", "confidence": 97}
    ],
    "text": "MacBook Pro",
    "logos": ["Apple"],
    "colors": [
      {"red": 128, "green": 128, "blue": 128}
    ]
  },
  "image_path": "/uploads/analysis-123.jpg"
}
```

---

## Barcode Endpoints

### Scan Barcode

Scan and process barcode from image.

**Endpoint:** `POST /barcode/scan`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (required): Image file containing barcode

**Response:**
```json
{
  "success": true,
  "barcode": {
    "value": "123456789012",
    "format": "EAN-13",
    "valid": true
  },
  "product": {
    "name": "Product Name",
    "brand": "Brand Name",
    "category": "Category",
    "description": "Product description",
    "image_url": "https://..."
  },
  "image_path": "/uploads/barcode-123.jpg"
}
```

### Lookup Barcode

Get product information for a barcode.

**Endpoint:** `GET /barcode/lookup/:barcode`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "barcode": {
    "value": "123456789012",
    "format": "EAN-13",
    "valid": true
  },
  "product": {...},
  "in_inventory": true,
  "inventory_item": {...}
}
```

### Register Item with Barcode

Create a new item using barcode.

**Endpoint:** `POST /barcode/register`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `barcode` (required): Barcode value
- `name` (optional): Item name (auto-filled if found)
- `description` (optional): Description
- `quantity` (optional): Quantity
- `category_id` (optional): Category ID
- `container_id` (optional): Container ID
- `location_id` (optional): Location ID
- `image` (optional): Image file

**Response:**
```json
{
  "success": true,
  "message": "Item registered successfully",
  "item": {...}
}
```

### Find Item by Barcode

Locate an item in your inventory by barcode.

**Endpoint:** `GET /barcode/find/:barcode`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "item": {
    "id": 1,
    "name": "Product Name",
    "description": "...",
    "quantity": 1,
    "category": "Electronics",
    "location": "Office",
    "container": "Desk Drawer",
    "location_path": "Office > Desk Drawer",
    "barcode": "123456789012",
    "image_path": "/uploads/item.jpg"
  }
}
```

### Validate Barcode

Check if a barcode format is valid.

**Endpoint:** `POST /barcode/validate`

**Authentication:** Required

**Request Body:**
```json
{
  "barcode": "123456789012"
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "valid": true,
    "format": "EAN-13",
    "barcode": "123456789012"
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per 15 minutes per user
- 10 AI requests per hour per user
- 50 barcode lookups per day per user

## Pagination

Not currently implemented. All list endpoints return all results. Future versions will include:
- `page` parameter
- `limit` parameter
- Response metadata with total count

---

**Last Updated:** January 2026