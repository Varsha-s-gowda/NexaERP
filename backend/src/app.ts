import express from "express";
import type { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import rateLimit from "express-rate-limit";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import followUpRoutes from "./routes/followup.routes.js";
import productRoutes from "./routes/product.routes.js";
import warehouseRoutes from "./routes/warehouse.routes.js";
import stockMovementRoutes from "./routes/stockMovement.routes.js";
import salesChallanRoutes from "./routes/salesChallan.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { swaggerSpec } from "./config/swagger.js";

const app: Application = express();

// Environment variables
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// Security Middleware
app.use(helmet());

// CORS Configuration
const cleanFrontendUrl = FRONTEND_URL.replace(/\/$/, "");
const corsOrigins = NODE_ENV === 'development' 
  ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000']
  : [cleanFrontendUrl];

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

// Request Logging (Morgan) - Skip in test environment
if (NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use("/api", limiter);

// Other middleware
app.use(compression());
app.use(cookieParser());

// Health Check Route (no authentication required)
app.use("/api", healthRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/customers", followUpRoutes);
app.use("/api/products", productRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/sales-challans", salesChallanRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

// Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;