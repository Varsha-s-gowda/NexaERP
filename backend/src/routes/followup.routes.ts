import { Router } from "express";
import { FollowUpController } from "../controllers/followup.controller.js";
import { FollowUpService } from "../services/followup.service.js";
import { FollowUpRepository } from "../repositories/followup.repository.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorize.middleware.js";
import { Role } from "@prisma/client";

const router = Router();

const followUpRepository = new FollowUpRepository();
const followUpService = new FollowUpService(followUpRepository);
const followUpController = new FollowUpController(followUpService);

/**
 * @swagger
 * /api/customers/{customerId}/follow-ups:
 *   post:
 *     summary: Create a follow-up for a customer
 *     description: Create a new follow-up record for a customer
 *     tags: [Follow-ups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Discussed new product offerings
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-20T10:00:00Z
 *     responses:
 *       201:
 *         description: Follow-up created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:customerId/follow-ups",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  followUpController.create.bind(followUpController)
);

/**
 * @swagger
 * /api/customers/{customerId}/follow-ups:
 *   get:
 *     summary: Get all follow-ups for a customer
 *     description: Retrieve all follow-ups for a specific customer
 *     tags: [Follow-ups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Follow-ups retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:customerId/follow-ups",
  authenticate,
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  followUpController.getByCustomerId.bind(followUpController)
);

export default router;
