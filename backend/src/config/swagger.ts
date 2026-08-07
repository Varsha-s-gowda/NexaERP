import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NexaERP API",
      version: "1.0.0",
      description: "REST API documentation for the NexaERP Backend.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login endpoint",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "User ID",
            },
            fullName: {
              type: "string",
              description: "User full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            role: {
              type: "string",
              enum: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"],
              description: "User role",
            },
            isActive: {
              type: "boolean",
              description: "User active status",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Update timestamp",
            },
          },
        },
        Customer: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Customer ID",
            },
            customerCode: {
              type: "string",
              description: "Unique customer code",
            },
            customerName: {
              type: "string",
              description: "Customer name",
            },
            businessName: {
              type: "string",
              description: "Business name",
            },
            mobile: {
              type: "string",
              description: "Mobile number",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email address",
              nullable: true,
            },
            gstNumber: {
              type: "string",
              description: "GST number",
              nullable: true,
            },
            customerType: {
              type: "string",
              enum: ["RETAIL", "WHOLESALE", "DISTRIBUTOR"],
              description: "Customer type",
            },
            status: {
              type: "string",
              enum: ["LEAD", "ACTIVE", "INACTIVE"],
              description: "Customer status",
            },
            address: {
              type: "string",
              description: "Customer address",
            },
            followUpDate: {
              type: "string",
              format: "date-time",
              description: "Follow-up date",
              nullable: true,
            },
            notes: {
              type: "string",
              description: "Additional notes",
              nullable: true,
            },
            createdBy: {
              type: "string",
              format: "uuid",
              description: "Creator user ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Update timestamp",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Product ID",
            },
            productCode: {
              type: "string",
              description: "Unique product code",
            },
            productName: {
              type: "string",
              description: "Product name",
            },
            category: {
              type: "string",
              description: "Product category",
            },
            purchasePrice: {
              type: "number",
              format: "decimal",
              description: "Purchase price",
            },
            sellingPrice: {
              type: "number",
              format: "decimal",
              description: "Selling price",
            },
            gstPercentage: {
              type: "number",
              description: "GST percentage",
            },
            stockQuantity: {
              type: "integer",
              description: "Current stock quantity",
            },
            minimumStock: {
              type: "integer",
              description: "Minimum stock threshold",
            },
            description: {
              type: "string",
              description: "Product description",
              nullable: true,
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE"],
              description: "Product status",
            },
            warehouseId: {
              type: "string",
              format: "uuid",
              description: "Warehouse ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Update timestamp",
            },
          },
        },
        Warehouse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Warehouse ID",
            },
            name: {
              type: "string",
              description: "Warehouse name",
            },
            location: {
              type: "string",
              description: "Warehouse location",
            },
            capacity: {
              type: "number",
              description: "Warehouse capacity",
            },
            manager: {
              type: "string",
              description: "Warehouse manager",
              nullable: true,
            },
            contact: {
              type: "string",
              description: "Contact number",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Update timestamp",
            },
          },
        },
        StockMovement: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Stock movement ID",
            },
            productId: {
              type: "string",
              format: "uuid",
              description: "Product ID",
            },
            productCode: {
              type: "string",
              description: "Product code",
            },
            productName: {
              type: "string",
              description: "Product name",
            },
            quantity: {
              type: "integer",
              description: "Quantity moved",
            },
            movementType: {
              type: "string",
              enum: ["IN", "OUT"],
              description: "Movement type",
            },
            reason: {
              type: "string",
              description: "Reason for movement",
            },
            createdBy: {
              type: "string",
              format: "uuid",
              description: "Creator user ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Update timestamp",
            },
          },
        },
        SalesChallan: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Sales challan ID",
            },
            challanNumber: {
              type: "string",
              description: "Unique challan number",
            },
            customerId: {
              type: "string",
              format: "uuid",
              description: "Customer ID",
            },
            customerName: {
              type: "string",
              description: "Customer name",
            },
            totalQuantity: {
              type: "integer",
              description: "Total quantity",
            },
            totalAmount: {
              type: "number",
              format: "decimal",
              description: "Total amount",
            },
            status: {
              type: "string",
              enum: ["DRAFT", "CONFIRMED", "CANCELLED"],
              description: "Challan status",
            },
            createdBy: {
              type: "string",
              format: "uuid",
              description: "Creator user ID",
            },
            items: {
              type: "array",
              items: {
                $ref: "#/components/schemas/SalesChallanItem",
              },
              description: "Challan items",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Update timestamp",
            },
          },
        },
        SalesChallanItem: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Item ID",
            },
            productId: {
              type: "string",
              format: "uuid",
              description: "Product ID",
            },
            productCode: {
              type: "string",
              description: "Product code",
            },
            productName: {
              type: "string",
              description: "Product name",
            },
            sellingPrice: {
              type: "number",
              format: "decimal",
              description: "Selling price",
            },
            quantity: {
              type: "integer",
              description: "Quantity",
            },
            totalPrice: {
              type: "number",
              format: "decimal",
              description: "Total price",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Update timestamp",
            },
          },
        },
        DashboardSummary: {
          type: "object",
          properties: {
            totalCustomers: {
              type: "integer",
              description: "Total customers",
            },
            activeCustomers: {
              type: "integer",
              description: "Active customers",
            },
            totalProducts: {
              type: "integer",
              description: "Total products",
            },
            lowStockProducts: {
              type: "integer",
              description: "Low stock products count",
            },
            totalWarehouses: {
              type: "integer",
              description: "Total warehouses",
            },
            totalSales: {
              type: "integer",
              description: "Total sales challans",
            },
            confirmedSales: {
              type: "integer",
              description: "Confirmed sales",
            },
            cancelledSales: {
              type: "integer",
              description: "Cancelled sales",
            },
            totalRevenue: {
              type: "number",
              format: "decimal",
              description: "Total revenue",
            },
            todayRevenue: {
              type: "number",
              format: "decimal",
              description: "Today's revenue",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "Request success status",
            },
            statusCode: {
              type: "integer",
              description: "HTTP status code",
            },
            message: {
              type: "string",
              description: "Response message",
            },
            data: {
              type: "object",
              description: "Response data",
              nullable: true,
            },
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
              description: "Error status",
            },
            statusCode: {
              type: "integer",
              description: "HTTP status code",
            },
            message: {
              type: "string",
              description: "Error message",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Validation errors",
              nullable: true,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
