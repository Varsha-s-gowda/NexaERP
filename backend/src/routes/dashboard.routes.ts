import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { DashboardService } from "../services/dashboard.service.js";
import { DashboardRepository } from "../repositories/dashboard.repository.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

const dashboardRepository = new DashboardRepository();
const dashboardService = new DashboardService(dashboardRepository);
const dashboardController = new DashboardController(dashboardService);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard metrics (filtered by user role)
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary
 *     description: Retrieve dashboard metrics based on user role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *   200:
 *     description: Dashboard summary retrieved
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             statusCode:
 *               type: integer
 *             message:
 *               type: string
 *             data:
 *               $ref: '#/components/schemas/DashboardSummary'
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied
 *   500:
 *     description: Internal server error
 */
router.get(
  "/summary",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  dashboardController.summary.bind(dashboardController)
);

/**
 * @swagger
 * /api/dashboard/low-stock:
 *   get:
 *     summary: Get low stock products
 *     description: Retrieve products below minimum stock (ADMIN/WAREHOUSE only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *   200:
 *     description: Low stock products retrieved
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             statusCode:
 *               type: integer
 *             message:
 *               type: string
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied (SALES/ACCOUNTS cannot view)
 *   500:
 *     description: Internal server error
 */
router.get(
  "/low-stock",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  dashboardController.lowStock.bind(dashboardController)
);

/**
 * @swagger
 * /api/dashboard/monthly-sales:
 *   get:
 *     summary: Get monthly sales data
 *     description: Retrieve monthly sales summary (ADMIN/SALES/ACCOUNTS only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *   200:
 *     description: Monthly sales retrieved
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             statusCode:
 *               type: integer
 *             message:
 *               type: string
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied (WAREHOUSE cannot view)
 *   500:
 *     description: Internal server error
 */
router.get(
  "/monthly-sales",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  dashboardController.monthlySales.bind(dashboardController)
);

export default router;
