# NexaERP Credentials & Environment Configuration

## Test Accounts

The following test accounts are available for demonstrating the NexaERP role-based access control (RBAC).

| Role | Email / Username | Password |
|---|---|---|
| ADMIN | `admin@nexaerp.com` | `admin123` |
| SALES | `sales@nexaerp.com` | `Test@12345` |
| ACCOUNTS | `accounts@nexaerp.com` | `Test@12345` |
| WAREHOUSE | `warehouse@nexaerp.com` | `Test@12345` |

> **Login:** Use the email address as the username.

### Role Access

- **ADMIN** — Full system access and user management.
- **SALES** — Customer and sales-related operations.
- **ACCOUNTS** — Sales, payment, and financial/reporting operations.
- **WAREHOUSE** — Products, inventory, warehouses, and stock movement operations.

---

## Environment Variables

The NexaERP backend requires the following environment variables:

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port on which the backend server runs. |
| `NODE_ENV` | No | Application environment (`development`, `production`, etc.). |
| `DATABASE_URL` | Yes | PostgreSQL/Neon database connection URL. |
| `JWT_SECRET` | Yes | Secret used to sign JWT authentication tokens. |
| `JWT_EXPIRES_IN` | No | JWT token expiration duration. |
| `FRONTEND_URL` | Yes | Frontend URL allowed by CORS. |

### Example `.env`

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"


---

## Database Configuration

NexaERP uses PostgreSQL with Prisma ORM.

The `DATABASE_URL` environment variable contains the connection string for the PostgreSQL database.

For local development, use your local PostgreSQL connection or development database.

For production, NexaERP uses a Neon PostgreSQL database.

Example format:

```text
postgresql://<username>:<password>@<host>:5432/<database>?schema=public