import { body } from "express-validator";

export const createStockMovementValidator = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isUUID()
    .withMessage("Invalid product ID format"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be greater than zero"),

  body("movementType")
    .notEmpty()
    .withMessage("Movement type is required")
    .isIn(["IN", "OUT", "TRANSFER"])
    .withMessage("Movement type must be IN, OUT, or TRANSFER"),

  body("reason")
    .optional()
    .trim()
    .isLength({ min: 2, max: 500 })
    .withMessage("Reason must be between 2 and 500 characters"),

  body("fromWarehouseId")
    .optional()
    .isUUID()
    .withMessage("Invalid from warehouse ID format"),

  body("toWarehouseId")
    .optional()
    .isUUID()
    .withMessage("Invalid to warehouse ID format"),
];
