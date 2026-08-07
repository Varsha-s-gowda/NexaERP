import { body } from "express-validator";

export const createProductValidator = [
  body("productCode")
    .notEmpty()
    .withMessage("Product code is required")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Product code must be between 2 and 50 characters"),

  body("productName")
    .notEmpty()
    .withMessage("Product name is required")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category must be between 2 and 100 characters"),

  body("purchasePrice")
    .notEmpty()
    .withMessage("Purchase price is required")
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("gstPercentage")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("GST percentage must be a positive number"),

  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer"),

  body("minimumStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum stock must be a non-negative integer"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),

  body("warehouseId")
    .notEmpty()
    .withMessage("Warehouse ID is required")
    .isUUID()
    .withMessage("Invalid warehouse ID format"),
];

export const updateProductValidator = [
  body("productCode")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Product code must be between 2 and 50 characters"),

  body("productName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category must be between 2 and 100 characters"),

  body("purchasePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Purchase price must be a positive number"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("gstPercentage")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("GST percentage must be a positive number"),

  body("stockQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a non-negative integer"),

  body("minimumStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum stock must be a non-negative integer"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),

  body("warehouseId")
    .optional()
    .isUUID()
    .withMessage("Invalid warehouse ID format"),
];
