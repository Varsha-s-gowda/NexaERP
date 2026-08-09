import { prisma } from "../lib/prisma.js";

export function setupGracefulShutdown(server: any): void {
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n📢 ${signal} received. Starting graceful shutdown...`);

    try {
      server.close(() => {
        console.log("✅ HTTP server closed");
      });

      await prisma.$disconnect();
      console.log("✅ Database disconnected");

      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("uncaughtException", async (error: Error) => {
    console.error("❌ Uncaught Exception:", error);
    await prisma.$disconnect();
    process.exit(1);
  });

  process.on("unhandledRejection", async (reason: unknown) => {
    console.error("❌ Unhandled Promise Rejection:", reason);
    await prisma.$disconnect();
    process.exit(1);
  });
}
