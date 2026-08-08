import { Router } from "express";
import { WarehouseController } from "../controllers/warehouse.controller.js";
import { WarehouseService } from "../services/warehouse.service.js";
import { WarehouseRepository } from "../repositories/warehouse.repository.js";
import { createWarehouseValidator, updateWarehouseValidator } from "../validators/warehouse.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

const warehouseRepository = new WarehouseRepository();
const warehouseService = new WarehouseService(warehouseRepository);
const warehouseController = new WarehouseController(warehouseService);

/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Warehouse management endpoints (WAREHOUSE read-only)
 */

/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Create warehouse
 *     description: Create a new warehouse (ADMIN only)
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location]
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: number
 *               manager:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Warehouse created
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
 *                   $ref: '#/components/schemas/Warehouse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (WAREHOUSE cannot create)
 *       409:
 *         description: Warehouse name exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(Role.ADMIN),
  createWarehouseValidator,
  validate,
  warehouseController.create.bind(warehouseController)
);

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Get all warehouses
 *     description: Retrieve all warehouses
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Warehouses retrieved
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
 *                     $ref: '#/components/schemas/Warehouse'
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
  warehouseController.getAll.bind(warehouseController)
);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   get:
 *     summary: Get warehouse by ID
 *     description: Retrieve specific warehouse
 *     tags: [Warehouses]
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
 *         description: Warehouse retrieved
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
 *                   $ref: '#/components/schemas/Warehouse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Warehouse not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  warehouseController.getById.bind(warehouseController)
);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     summary: Update warehouse
 *     description: Update warehouse (ADMIN only)
 *     tags: [Warehouses]
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
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: number
 *               manager:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Warehouse updated
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
 *                   $ref: '#/components/schemas/Warehouse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (WAREHOUSE cannot update)
 *       404:
 *         description: Warehouse not found
 *       409:
 *         description: Warehouse name exists
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN),
  updateWarehouseValidator,
  validate,
  warehouseController.update.bind(warehouseController)
);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   delete:
 *     summary: Delete warehouse
 *     description: Delete warehouse (ADMIN only)
 *     tags: [Warehouses]
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
 *         description: Warehouse deleted
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (WAREHOUSE cannot delete)
 *       404:
 *         description: Warehouse not found
 *       409:
 *         description: Warehouse has products
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Role.ADMIN),
  warehouseController.delete.bind(warehouseController)
);

export default router;
