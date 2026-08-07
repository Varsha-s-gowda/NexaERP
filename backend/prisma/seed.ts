import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: "admin@nexaerp.com",
    },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists.");
    return;
  }

  const hashedPassword = await hashPassword("admin123");

  await prisma.user.create({
    data: {
      fullName: "System Administrator",
      email: "admin@nexaerp.com",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin user created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });