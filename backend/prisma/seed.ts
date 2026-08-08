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

  // Seed required test users
  const testUsers = [
    {
      email: "sales@nexaerp.com",
      fullName: "Sales Executive",
      role: "SALES",
    },
    {
      email: "accounts@nexaerp.com",
      fullName: "Accounts Executive",
      role: "ACCOUNTS",
    },
    {
      email: "warehouse@nexaerp.com",
      fullName: "Warehouse Manager",
      role: "WAREHOUSE",
    },
  ];

  const defaultPasswordHash = await hashPassword("Test@12345");

  for (const user of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      // Update password to match the requested one
      await prisma.user.update({
        where: { email: user.email },
        data: { password: defaultPasswordHash, role: user.role as any },
      });
      console.log(`✅ User ${user.email} updated to Test@12345.`);
    } else {
      await prisma.user.create({
        data: {
          fullName: user.fullName,
          email: user.email,
          password: defaultPasswordHash,
          role: user.role as any,
          isActive: true,
        },
      });
      console.log(`✅ User ${user.email} created.`);
    }
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