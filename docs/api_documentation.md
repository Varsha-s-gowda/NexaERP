# NexaERP REST API Reference Manual

This document provides a comprehensive reference of all REST API endpoints exposed by the NexaERP Backend. All request bodies and responses are in JSON format.

---

*Version:* v1
*Base URL (Development):* https://nexa-erp-delta.vercel.app/
*Base URL (Production):* https://nexaerp-k2ho.onrender.com
*Auth:* JWT Bearer Token
*Content-Type:* application/json

## Global API Features

### Base URL
- **Local Development**: `http://localhost:3000`
- **Prefix**: `/api`

### Content-Type
- Requests containing bodies must include the header: `Content-Type: application/json`

### Authentication & Security
- Most endpoints require a JSON Web Token (JWT) provided in the `Authorization` header as a Bearer token:
  ```http
  Authorization: Bearer <your-jwt-token>
  ```
- Specific endpoints are restricted based on user roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.

---

## 1. Authentication & User Management (`/api/auth`)

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | No | All | Authenticate user credentials and retrieve a JWT access token. |
| `/auth/register` | `POST` | Yes | `ADMIN` | Register a new user account. |
| `/auth/users` | `GET` | Yes | `ADMIN` | Retrieve a list of all system users. |
| `/auth/users/:id` | `PATCH` | Yes | `ADMIN` | Update status (`isActive`) or role of a user. |
| `/auth/users/:id` | `DELETE` | Yes | `ADMIN` | Delete a user account from the system. |

---

## 2. Customer Management (`/api/customers`)

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/customers` | `POST` | Yes | `ADMIN`, `SALES` | Create a new customer profile. |
| `/customers` | `GET` | Yes | `ADMIN`, `SALES`, `ACCOUNTS` | Search and list customers (supports search, pagination). |
| `/customers/:id` | `GET` | Yes | `ADMIN`, `SALES`, `ACCOUNTS` | Retrieve details of a specific customer by ID. |
| `/customers/:id` | `PUT` | Yes | `ADMIN`, `SALES` | Update a customer's details. |
| `/customers/:id` | `DELETE` | Yes | `ADMIN` | Permanently delete a customer record. |

### Customer Follow-Ups (`/api/customers/:customerId/followups`)

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/customers/:customerId/followups` | `POST` | Yes | `ADMIN`, `SALES` | Log a new follow-up interaction or note. |
| `/customers/:customerId/followups` | `GET` | Yes | `ADMIN`, `SALES` | Retrieve history of all follow-ups for a customer. |

---

## 3. Inventory & Product Catalog (`/api/products`)

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/products` | `POST` | Yes | `ADMIN`, `WAREHOUSE` | Add a new product to the catalog. |
| `/products` | `GET` | Yes | All | Retrieve catalog products (with warehouse inventory details). |
| `/products/:id` | `GET` | Yes | All | Get product details by ID. |
| `/products/:id` | `PUT` | Yes | `ADMIN`, `WAREHOUSE` | Update product properties or pricing. |
| `/products/:id` | `DELETE` | Yes | `ADMIN` | Delete a product from the catalog. |

---

## 4. Warehouse Configuration (`/api/warehouses`)

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/warehouses` | `POST` | Yes | `ADMIN` | Register a new warehouse facility. |
| `/warehouses` | `GET` | Yes | All | List all warehouses. |
| `/warehouses/:id` | `GET` | Yes | All | Get warehouse details and list of in-stock products. |
| `/warehouses/:id` | `PUT` | Yes | `ADMIN` | Update warehouse details. |
| `/warehouses/:id` | `DELETE` | Yes | `ADMIN` | Remove a warehouse. |

---

## 5. Stock Movements (`/api/stock-movements`)

Tracks the inbound (`IN`), outbound (`OUT`), and internal (`TRANSFER`) flow of products between warehouses.

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/stock-movements` | `POST` | Yes | `ADMIN`, `WAREHOUSE` | Record a new stock transaction or transfer. |
| `/stock-movements` | `GET` | Yes | `ADMIN`, `WAREHOUSE` | List all historical stock movements. |
| `/stock-movements/:id` | `GET` | Yes | `ADMIN`, `WAREHOUSE` | Get specific stock movement details. |
| `/stock-movements/product/:productId` | `GET` | Yes | `ADMIN`, `WAREHOUSE` | Retrieve transaction logs for a single product. |

---

## 6. Sales & Delivery Challans (`/api/sales-challans`)

Manages sales orders, invoicing, delivery challans, and customer payment allocations.

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/sales-challans` | `POST` | Yes | `ADMIN`, `SALES` | Create a sales delivery challan (deducts warehouse inventory). |
| `/sales-challans` | `GET` | Yes | `ADMIN`, `SALES`, `ACCOUNTS` | List sales challans. |
| `/sales-challans/:id` | `GET` | Yes | `ADMIN`, `SALES`, `ACCOUNTS` | View individual challan details and item lines. |
| `/sales-challans/:id/status` | `PATCH` | Yes | `ADMIN`, `SALES` | Update challan status (`DRAFT`, `CONFIRMED`, `CANCELLED`). |
| `/sales-challans/:id/payments` | `POST` | Yes | `ADMIN`, `ACCOUNTS` | Record client payments against a sales invoice. |

---

## 7. Realtime Dashboard Summary (`/api/dashboard`)

Provides analytical data visualizations for the NexaERP Landing Page.

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/dashboard/summary` | `GET` | Yes | All | Returns system totals (revenue, counts, active states). |
| `/dashboard/low-stock` | `GET` | Yes | `ADMIN`, `WAREHOUSE` | Returns list of products below `minimumStock` thresholds. |
| `/dashboard/recent-activities`| `GET` | Yes | All | Returns audit log of recent system creations. |

---

## 8. Report Generation & Exports (`/api/reports`)

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/reports/sales` | `GET` | Yes | `ADMIN`, `ACCOUNTS` | Retrieve sales and revenue analysis over a date range. |
| `/reports/inventory` | `GET` | Yes | `ADMIN`, `WAREHOUSE` | Returns inventory valuation, turnovers, and levels. |
| `/reports/customers` | `GET` | Yes | `ADMIN`, `SALES`, `ACCOUNTS` | Returns top client revenue contributions. |
| `/reports/warehouses` | `GET` | Yes | `ADMIN`, `WAREHOUSE` | Provides comparative stocks per warehouse. |

---

## 9. Utility & Health Status (`/api/health`)

| Endpoint | Method | Auth Required | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | No | All | Basic health status checks. |

---

## Standardized JSON Formats

### Successful Response Format
All successful responses return a `2xx` HTTP status code:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Action performed successfully",
  "data": {}
}
```

### Error Response Format
Validation errors, authentication blocks, or query exceptions return `4xx` or `5xx` statuses:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Input validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Invalid email format",
      "path": "email",
      "location": "body"
    }
  ]
}
```
