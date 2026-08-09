import "dotenv/config";
import app from "./app.js";
import { validateEnv } from "./utils/envValidation.js";
import { setupGracefulShutdown } from "./utils/gracefulShutdown.js";
import { prisma } from "./lib/prisma.js";

validateEnv();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const server = app.listen(PORT, async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🚀 NexaERP Backend Server");
  console.log("=".repeat(50));
  console.log(`📝 Application Name: NexaERP Backend`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`✅ Database: Connected`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log("=".repeat(50) + "\n");
});

setupGracefulShutdown(server);
