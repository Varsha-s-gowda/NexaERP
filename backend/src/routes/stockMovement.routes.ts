import { Router } from "express";
import { StockMovementController } from "../controllers/stockMovement.controller.js";
import { StockMovementService } from "../services/stockMovement.service.js";
import { StockMovementRepository } from "../repositories/stockMovement.repository.js";
import { createStockMovementValidator } from "../validators/stockMovement.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

const stockMovementRepository = new StockMovementRepository();
const stockMovementService = new StockMovementService(stockMovementRepository);
const stockMovementController = new StockMovementController(stockMovementService);

/**
 * @swagger
 * tags:
 *   name: Stock Movements
 *   description: Stock movement tracking (WAREHOUSE can create, cannot delete/edit)
 */

/**
 * @swagger
 * /api/stock-movements:
 *   post:
 *     summary: Create stock movement
 *     description: Record stock IN or OUT movement
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity, movementType, reason]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               movementType:
 *                 type: string
 *                 enum: [IN, OUT]
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stock movement created
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
 *                   $ref: '#/components/schemas/StockMovement'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product not found
 *       409:
 *         description: Insufficient stock
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  createStockMovementValidator,
  validate,
  stockMovementController.create.bind(stockMovementController)
);

/**
 * @swagger
 * /api/stock-movements:
 *   get:
 *     summary: Get all stock movements
 *     description: Retrieve all stock movements
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock movements retrieved
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
 *                     $ref: '#/components/schemas/StockMovement'
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
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  stockMovementController.getAll.bind(stockMovementController)
);

/**
 * @swagger
 * /api/stock-movements/{id}:
 *   get:
 *     summary: Get stock movement by ID
 *     description: Retrieve specific stock movement
 *     tags: [Stock Movements]
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
 *         description: Stock movement retrieved
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
 *                   $ref: '#/components/schemas/StockMovement'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Stock movement not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  stockMovementController.getById.bind(stockMovementController)
);

/**
 * @swagger
 * /api/stock-movements/product/{productId}:
 *   get:
 *     summary: Get stock movements by product
 *     description: Retrieve stock movements for a specific product
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock movements retrieved
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
 *                     $ref: '#/components/schemas/StockMovement'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/product/:productId",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  stockMovementController.getByProduct.bind(stockMovementController)
);

export default router;
