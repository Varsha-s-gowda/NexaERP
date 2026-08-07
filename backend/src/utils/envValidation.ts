const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "PORT",
  "FRONTEND_URL",
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    console.error("\nPlease set these variables in your .env file.");
    process.exit(1);
  }

  console.log("✅ Environment variables validated successfully");
}
