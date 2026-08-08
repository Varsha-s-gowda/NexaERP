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
  } else {
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

  // Check if warehouses exist
  const warehouseCount = await prisma.warehouse.count();
  
  if (warehouseCount === 0) {
    await prisma.warehouse.createMany({
      data: [
        {
          name: "Main Warehouse",
          location: "Industrial Area, Zone 1",
          isActive: true,
        },
        {
          name: "East Warehouse",
          location: "Industrial Area, Zone 2",
          isActive: true,
        },
        {
          name: "West Warehouse",
          location: "Industrial Area, Zone 3",
          isActive: true,
        },
      ],
    });
    console.log("✅ Default warehouses created successfully.");
  } else {
    console.log("✅ Warehouses already exist.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });