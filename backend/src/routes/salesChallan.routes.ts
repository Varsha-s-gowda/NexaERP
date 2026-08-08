import { Router } from "express";
import { SalesChallanController } from "../controllers/salesChallan.controller.js";
import { SalesChallanService } from "../services/salesChallan.service.js";
import { SalesChallanRepository } from "../repositories/salesChallan.repository.js";
import {
  createSalesChallanValidator,
  updateChallanStatusValidator
} from "../validators/salesChallan.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

const salesChallanRepository = new SalesChallanRepository();
const salesChallanService = new SalesChallanService(salesChallanRepository);
const salesChallanController = new SalesChallanController(salesChallanService);

/**
 * @swagger
 * tags:
 *   name: Sales Challans
 *   description: Sales challan management (SALES can create/view own, ACCOUNTS read-only)
 */

/**
 * @swagger
 * /api/sales-challans:
 *   post:
 *     summary: Create sales challan
 *     description: Create a new sales challan with items
 *     tags: [Sales Challans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, items]
 *             properties:
 *               customerId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Sales challan created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SalesChallan'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Customer or product not found
 *       409:
 *         description: Insufficient stock
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES),
  createSalesChallanValidator,
  validate,
  salesChallanController.create.bind(salesChallanController)
);

/**
 * @swagger
 * /api/sales-challans:
 *   get:
 *     summary: Get all sales challans
 *     description: Retrieve sales challans (filtered by user role)
 *     tags: [Sales Challans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales challans retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalesChallan'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  salesChallanController.getAll.bind(salesChallanController)
);

/**
 * @swagger
 * /api/sales-challans/{id}:
 *   get:
 *     summary: Get sales challan by ID
 *     description: Retrieve specific sales challan
 *     tags: [Sales Challans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sales challan retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SalesChallan'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (SALES can only view own)
 *       404:
 *         description: Sales challan not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  salesChallanController.getById.bind(salesChallanController)
);

/**
 * @swagger
 * /api/sales-challans/{id}/status:
 *   patch:
 *     summary: Update challan status
 *     description: Confirm or cancel sales challan (ADMIN only)
 *     tags: [Sales Challans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SalesChallan'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (SALES/ACCOUNTS cannot change status)
 *       404:
 *         description: Sales challan not found
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(Role.ADMIN),
  updateChallanStatusValidator,
  validate,
  salesChallanController.updateStatus.bind(salesChallanController)
);

export default router;
