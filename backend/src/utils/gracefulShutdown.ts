import { prisma } from "../lib/prisma.js";

export function setupGracefulShutdown(server: any): void {
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n📢 ${signal} received. Starting graceful shutdown...`);

    try {
      // Stop accepting new connections
      server.close(() => {
        console.log("✅ HTTP server closed");
      });

      // Disconnect from database
      await prisma.$disconnect();
      console.log("✅ Database disconnected");

      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  };

  // Handle SIGINT (Ctrl+C)
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle SIGTERM
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught exceptions
  process.on("uncaughtException", async (error: Error) => {
    console.error("❌ Uncaught Exception:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", async (reason: unknown) => {
    console.error("❌ Unhandled Promise Rejection:", reason);
    await prisma.$disconnect();
    process.exit(1);
  });
}
