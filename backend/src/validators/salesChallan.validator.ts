import { body } from "express-validator";

export const createSalesChallanValidator = [
  body("customerId")
    .notEmpty()
    .withMessage("Customer ID is required")
    .isUUID()
    .withMessage("Invalid customer ID format"),

  body("items")
    .notEmpty()
    .withMessage("Items are required")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),

  body("items.*.productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isUUID()
    .withMessage("Invalid product ID format"),

  body("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be greater than zero"),
];

export const updateChallanStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["DRAFT", "CONFIRMED", "CANCELLED"])
    .withMessage("Status must be DRAFT, CONFIRMED, or CANCELLED"),
];
