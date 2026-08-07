# NexaERP Backend

REST API backend for the NexaERP Enterprise Resource Planning system.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Role-Based Access Control (RBAC)**: ADMIN, SALES, WAREHOUSE, ACCOUNTS roles
- **Modules**: Customers, Products, Warehouses, Stock Movements, Sales Challans, Dashboard, Reports
- **API Documentation**: Swagger/OpenAPI 3.0 documentation at `/api/docs`
- **Security**: Production-ready security middleware
- **Health Check**: Database connectivity check endpoint
- **Request Logging**: Morgan HTTP request logging

## Security Features

### Helmet
Configured with recommended defaults to protect against common HTTP vulnerabilities:
- Sets secure HTTP headers
- Prevents clickjacking
- Protects against XSS attacks
- Disables X-Powered-By header

### CORS (Cross-Origin Resource Sharing)
- Configured to allow requests only from the specified frontend URL
- Allowed methods: GET, POST, PUT, PATCH, DELETE
- Allowed headers: Authorization, Content-Type
- Credentials enabled for cookie-based authentication
- Environment variable: `FRONTEND_URL` (defaults to `http://localhost:5173`)

### Rate Limiting
- 100 requests per 15 minutes per IP address
- Applied to all `/api` routes
- Returns JSON response with status 429 when limit exceeded
- Standard rate limit headers included

## Request Logging

### Morgan
- Uses `combined` format for detailed request logging
- Logs every HTTP request including method, URL, status, response time, and user agent
- Automatically disabled when `NODE_ENV=test` to avoid polluting test output
- Logs to console in development

## Health Check

### Health Endpoint
- **Endpoint**: `GET /api/health`
- **Authentication**: Not required
- **Purpose**: Check server and database connectivity

#### Success Response (200)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server is healthy",
  "data": {
    "uptime": 123.45,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "nodeVersion": "v18.17.0",
    "environment": "development",
    "database": "connected"
  }
}
```

#### Database Unavailable Response (503)
```json
{
  "success": false,
  "statusCode": 503,
  "message": "Database unavailable"
}
```

The health check performs a Prisma database query (`SELECT 1`) to verify database connectivity before returning the response.

## Environment Variables

Create a `.env` file based on `.env.example`:

### Required Variables

The following environment variables are **required** and must be set for the application to start:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db?schema=public"

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Note:** If any required environment variable is missing, the application will log an error and exit with code 1.

## Graceful Shutdown

The application implements graceful shutdown to handle termination signals properly:

### Signals Handled
- **SIGINT** (Ctrl+C)
- **SIGTERM** (termination signal)

### Shutdown Process
When a termination signal is received:
1. Log that shutdown has started
2. Stop accepting new HTTP requests
3. Close the HTTP server
4. Disconnect from the database (Prisma)
5. Exit cleanly with code 0

### Unhandled Errors
The application also handles uncaught exceptions and unhandled promise rejections:
- Log the error
- Disconnect from the database
- Exit with code 1

This ensures that all database connections are properly closed and no data is lost during shutdown.

## Installation

```bash
npm install
```

## Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/api/health`

## Middleware Order

The middleware is applied in the following order for optimal security:

1. **helmet** - Security headers
2. **cors** - Cross-origin resource sharing
3. **morgan** - HTTP request logging (skipped in test environment)
4. **express.json()** - JSON body parsing
5. **express.urlencoded()** - URL-encoded body parsing
6. **rateLimit** - Rate limiting (applied to /api routes)
7. **compression** - Response compression
8. **cookieParser** - Cookie parsing
9. **Routes** - API routes (health check first, then protected routes)
10. **errorHandler** - Global error handling

## API Endpoints

### Health
- `GET /api/health` - Health check (no authentication required)

### Authentication
- `POST /api/auth/login` - User login

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Warehouses
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id` - Get warehouse by ID
- `POST /api/warehouses` - Create warehouse
- `PUT /api/warehouses/:id` - Update warehouse
- `DELETE /api/warehouses/:id` - Delete warehouse

### Stock Movements
- `GET /api/stock-movements` - Get all stock movements
- `GET /api/stock-movements/:id` - Get stock movement by ID
- `GET /api/stock-movements/product/:productId` - Get movements by product
- `POST /api/stock-movements` - Create stock movement

### Sales Challans
- `GET /api/sales-challans` - Get all sales challans
- `GET /api/sales-challans/:id` - Get sales challan by ID
- `POST /api/sales-challans` - Create sales challan
- `PATCH /api/sales-challans/:id/status` - Update challan status

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/low-stock` - Get low stock products
- `GET /api/dashboard/monthly-sales` - Get monthly sales data

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/reports/inventory` - Get inventory report
- `GET /api/reports/customers` - Get customer report
- `GET /api/reports/products` - Get product report
- `GET /api/reports/top-selling` - Get top selling products

## Role-Based Access

### ADMIN
Full access to all modules and operations

### SALES
- Customers: Create, view own, update own
- Sales Challans: Create, view own, cannot confirm/cancel
- Dashboard: Sales metrics only
- Reports: Customer reports only

### WAREHOUSE
- Products: View all, update stock only, cannot modify prices or delete
- Warehouses: Read-only access
- Stock Movements: Create, view all, cannot delete/edit
- Dashboard: Inventory metrics only
- Reports: Inventory reports only

### ACCOUNTS
- Customers: Full access
- Sales Challans: Read-only access to all
- Dashboard: Revenue metrics only
- Reports: Sales and financial reports only

## License

MIT
