import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { ReportService } from "../services/report.service.js";
import { ReportRepository } from "../repositories/report.repository.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

const reportRepository = new ReportRepository();
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Business reports (filtered by user role)
 */

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Get sales report
 *     description: Generate sales report with filters (ADMIN/SALES/ACCOUNTS only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, CONFIRMED, CANCELLED]
 *     responses:
 *   200:
 *     description: Sales report generated
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
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied (WAREHOUSE cannot view)
 *   500:
 *     description: Internal server error
 */
router.get(
  "/sales",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  reportController.salesReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Get inventory report
 *     description: Generate inventory report (ADMIN/WAREHOUSE only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *   200:
 *     description: Inventory report generated
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
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied (SALES/ACCOUNTS cannot view)
 *   500:
 *     description: Internal server error
 */
router.get(
  "/inventory",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  reportController.inventoryReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/customers:
 *   get:
 *     summary: Get customer report
 *     description: Generate customer report (ADMIN/SALES only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *   200:
 *     description: Customer report generated
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
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied (WAREHOUSE/ACCOUNTS cannot view)
 *   500:
 *     description: Internal server error
 */
router.get(
  "/customers",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES),
  reportController.customerReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/products:
 *   get:
 *     summary: Get product report
 *     description: Generate product report (ADMIN/WAREHOUSE only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *   200:
 *     description: Product report generated
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
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied (SALES/ACCOUNTS cannot view)
 *   500:
 *     description: Internal server error
 */
router.get(
  "/products",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  reportController.productReport.bind(reportController)
);

/**
 * @swagger
 * /api/reports/top-selling:
 *   get:
 *     summary: Get top selling products
 *     description: Generate top selling products report (ADMIN/WAREHOUSE only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *   200:
 *     description: Top selling products retrieved
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
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Access denied (SALES/ACCOUNTS cannot view)
 *   500:
 *     description: Internal server error
 */
router.get(
  "/top-selling",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  reportController.topSellingProducts.bind(reportController)
);

export default router;
