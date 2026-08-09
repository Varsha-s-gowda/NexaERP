# ERP System

A production-quality Mini ERP + CRM Operations Portal.

VERCEL DEPLOYMENT LINK : https://nexa-erp-delta.vercel.app/login
RENDER DEPLOYEMENT LINK : https://nexaerp-k2ho.onrender.com

## login credentials

| Role | Email / Username | Password |
|---|---|---|
| ADMIN | `admin@nexaerp.com` | `admin123` |
| SALES | `sales@nexaerp.com` | `Test@12345` |
| ACCOUNTS | `accounts@nexaerp.com` | `Test@12345` |
| WAREHOUSE | `warehouse@nexaerp.com` | `Test@12345` |

 **Login:** Use the email address as the username.

 
## Project Structure

```
erp-system/
├── backend/          # Node.js + TypeScript backend
├── frontend/         # React + TypeScript frontend
├── docs/            # Documentation
├── README.md        # Project documentation
└── .gitignore       # Git ignore rules
```

## Backend

Built with Node.js, TypeScript, Express, and Prisma.

### Dependencies

- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **tsx**: TypeScript execution engine
- **Prisma**: ORM for database management
- **pg**: PostgreSQL driver
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **morgan**: HTTP request logger
- **compression**: Response compression
- **cookie-parser**: Cookie parsing
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **express-validator**: Request validation
- **uuid**: Unique identifier generation

### Scripts

- `npm run dev` - Start development server with tsx watch
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Frontend

Built with React, TypeScript, Vite, and Tailwind CSS.

### Dependencies

- **React**: UI library
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **@hookform/resolvers**: Form validation integration
- **React Hot Toast**: Toast notifications

### Development Tools

- **TypeScript**: Type-safe JavaScript
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vite**: Build tool and dev server

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Development Guidelines

- Clean Architecture
- Layered Architecture
- SOLID principles
- Strict TypeScript
- Reusable components
- Consistent naming conventions
- Proper error handling
- Proper validation


## Known Limitations

NexaERP provides basic payment tracking and is not intended to replace a complete accounting or financial management system.

Notifications are currently handled through in-application alerts; external email/SMS notification workflows are not included.