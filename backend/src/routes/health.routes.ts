import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";

const router = Router();
const healthController = new HealthController();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check server and database health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Server is healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       description: Server uptime in seconds
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     nodeVersion:
 *                       type: string
 *                       description: Node.js version
 *                     environment:
 *                       type: string
 *                       description: Current environment
 *                     database:
 *                       type: string
 *                       description: Database connection status
 *       503:
 *         description: Database unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 statusCode:
 *                   type: integer
 *                   example: 503
 *                 message:
 *                   type: string
 *                   example: "Database unavailable"
 */
router.get("/health", healthController.health.bind(healthController));

export default router;
