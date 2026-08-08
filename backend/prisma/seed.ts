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

  // Seed 10 Customers
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@nexaerp.com" }
  });
  const creatorId = adminUser ? adminUser.id : "";

  if (creatorId) {
    const customersData = [
      { customerCode: "CUST001", customerName: "Aarav Mehta", businessName: "Mehta Enterprises", mobile: "9876543210", email: "aarav@mehta.com", customerType: "WHOLESALE" as const, status: "ACTIVE" as const, address: "Mumbai, Maharashtra", createdBy: creatorId },
      { customerCode: "CUST002", customerName: "Diya Sharma", businessName: "Sharma Retailers", mobile: "9876543211", email: "diya@sharma.com", customerType: "RETAIL" as const, status: "ACTIVE" as const, address: "Delhi, NCR", createdBy: creatorId },
      { customerCode: "CUST003", customerName: "Vivaan Iyer", businessName: "Iyer Distributors", mobile: "9876543212", email: "vivaan@iyer.com", customerType: "DISTRIBUTOR" as const, status: "ACTIVE" as const, address: "Chennai, Tamil Nadu", createdBy: creatorId },
      { customerCode: "CUST004", customerName: "Aditya Verma", businessName: "Verma Traders", mobile: "9876543213", email: "aditya@verma.com", customerType: "WHOLESALE" as const, status: "LEAD" as const, address: "Bangalore, Karnataka", createdBy: creatorId },
      { customerCode: "CUST005", customerName: "Ananya Sen", businessName: "Sen & Sons", mobile: "9876543214", email: "ananya@sen.com", customerType: "RETAIL" as const, status: "ACTIVE" as const, address: "Kolkata, West Bengal", createdBy: creatorId },
      { customerCode: "CUST006", customerName: "Kabir Gupta", businessName: "Gupta Logistics", mobile: "9876543215", email: "kabir@gupta.com", customerType: "DISTRIBUTOR" as const, status: "ACTIVE" as const, address: "Hyderabad, Telangana", createdBy: creatorId },
      { customerCode: "CUST007", customerName: "Ira Joshi", businessName: "Joshi Stores", mobile: "9876543216", email: "ira@joshi.com", customerType: "RETAIL" as const, status: "INACTIVE" as const, address: "Pune, Maharashtra", createdBy: creatorId },
      { customerCode: "CUST008", customerName: "Rohan Das", businessName: "Das Enterprises", mobile: "9876543217", email: "rohan@das.com", customerType: "WHOLESALE" as const, status: "ACTIVE" as const, address: "Bhubaneswar, Odisha", createdBy: creatorId },
      { customerCode: "CUST009", customerName: "Sanya Malhotra", businessName: "Malhotra & Co", mobile: "9876543218", email: "sanya@malhotra.com", customerType: "DISTRIBUTOR" as const, status: "LEAD" as const, address: "Chandigarh, Punjab", createdBy: creatorId },
      { customerCode: "CUST010", customerName: "Dev Patel", businessName: "Patel Retail", mobile: "9876543219", email: "dev@patel.com", customerType: "RETAIL" as const, status: "ACTIVE" as const, address: "Ahmedabad, Gujarat", createdBy: creatorId },
    ];
    for (const cust of customersData) {
      const existing = await prisma.customer.findUnique({
        where: { customerCode: cust.customerCode }
      });
      if (!existing) {
        await prisma.customer.create({ data: cust });
        console.log(`✅ Seeded customer: ${cust.customerCode}`);
      }
    }
  }

  // Seed 10 Products
  const firstWarehouse = await prisma.warehouse.findFirst();
  const warehouseId = firstWarehouse ? firstWarehouse.id : "";

  if (warehouseId) {
    const productsData = [
      { productCode: "PROD001", productName: "Wireless Mouse", category: "Electronics", purchasePrice: 450.00, sellingPrice: 799.00, gstPercentage: 18.0, stockQuantity: 150, minimumStock: 20, warehouseId: warehouseId },
      { productCode: "PROD002", productName: "Mechanical Keyboard", category: "Electronics", purchasePrice: 1500.00, sellingPrice: 2499.00, gstPercentage: 18.0, stockQuantity: 80, minimumStock: 15, warehouseId: warehouseId },
      { productCode: "PROD003", productName: "USB-C Hub", category: "Electronics", purchasePrice: 800.00, sellingPrice: 1499.00, gstPercentage: 18.0, stockQuantity: 120, minimumStock: 10, warehouseId: warehouseId },
      { productCode: "PROD004", productName: "Noise Cancelling Headphones", category: "Audio", purchasePrice: 4000.00, sellingPrice: 6999.00, gstPercentage: 18.0, stockQuantity: 40, minimumStock: 5, warehouseId: warehouseId },
      { productCode: "PROD005", productName: "Bluetooth Speaker", category: "Audio", purchasePrice: 1200.00, sellingPrice: 1999.00, gstPercentage: 18.0, stockQuantity: 90, minimumStock: 15, warehouseId: warehouseId },
      { productCode: "PROD006", productName: "Ergonomic Office Chair", category: "Furniture", purchasePrice: 5000.00, sellingPrice: 8999.00, gstPercentage: 12.0, stockQuantity: 25, minimumStock: 5, warehouseId: warehouseId },
      { productCode: "PROD007", productName: "LED Desk Lamp", category: "Furniture", purchasePrice: 600.00, sellingPrice: 1199.00, gstPercentage: 12.0, stockQuantity: 70, minimumStock: 10, warehouseId: warehouseId },
      { productCode: "PROD008", productName: "Leather Wallet", category: "Accessories", purchasePrice: 350.00, sellingPrice: 599.00, gstPercentage: 5.0, stockQuantity: 200, minimumStock: 30, warehouseId: warehouseId },
      { productCode: "PROD009", productName: "Stainless Steel Water Bottle", category: "Accessories", purchasePrice: 300.00, sellingPrice: 499.00, gstPercentage: 12.0, stockQuantity: 180, minimumStock: 25, warehouseId: warehouseId },
      { productCode: "PROD010", productName: "High-Speed HDMI Cable", category: "Electronics", purchasePrice: 150.00, sellingPrice: 299.00, gstPercentage: 18.0, stockQuantity: 300, minimumStock: 50, warehouseId: warehouseId },
    ];
    for (const prod of productsData) {
      const existing = await prisma.product.findUnique({
        where: { productCode: prod.productCode }
      });
      if (!existing) {
        await prisma.product.create({ data: prod });
        console.log(`✅ Seeded product: ${prod.productCode}`);
      }
    }
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