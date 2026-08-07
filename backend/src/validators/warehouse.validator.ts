import { body } from "express-validator";

export const createWarehouseValidator = [
  body("name")
    .notEmpty()
    .withMessage("Warehouse name is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Warehouse name must be between 2 and 100 characters"),

  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Location must be between 2 and 200 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const updateWarehouseValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Warehouse name must be between 2 and 100 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Location must be between 2 and 200 characters"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];
