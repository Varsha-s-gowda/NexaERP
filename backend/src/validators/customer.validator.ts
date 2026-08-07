import { body } from "express-validator";

export const createCustomerValidator = [
  body("customerCode")
    .notEmpty()
    .withMessage("Customer code is required")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Customer code must be between 2 and 50 characters"),

  body("customerName")
    .notEmpty()
    .withMessage("Customer name is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Customer name must be between 2 and 100 characters"),

  body("businessName")
    .notEmpty()
    .withMessage("Business name is required")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),

  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required")
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Mobile number must be between 10 and 15 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  body("gstNumber")
    .optional()
    .trim()
    .isLength({ min: 15, max: 15 })
    .withMessage("GST number must be 15 characters"),

  body("customerType")
    .notEmpty()
    .withMessage("Customer type is required")
    .isIn(["RETAIL", "WHOLESALE", "DISTRIBUTOR"])
    .withMessage("Customer type must be RETAIL, WHOLESALE, or DISTRIBUTOR"),

  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters"),

  body("followUpDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid follow-up date format"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];

export const updateCustomerValidator = [
  body("customerName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Customer name must be between 2 and 100 characters"),

  body("businessName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),

  body("mobile")
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Mobile number must be between 10 and 15 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format"),

  body("gstNumber")
    .optional()
    .trim()
    .isLength({ min: 15, max: 15 })
    .withMessage("GST number must be 15 characters"),

  body("customerType")
    .optional()
    .isIn(["RETAIL", "WHOLESALE", "DISTRIBUTOR"])
    .withMessage("Customer type must be RETAIL, WHOLESALE, or DISTRIBUTOR"),

  body("status")
    .optional()
    .isIn(["LEAD", "ACTIVE", "INACTIVE"])
    .withMessage("Status must be LEAD, ACTIVE, or INACTIVE"),

  body("address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters"),

  body("followUpDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid follow-up date format"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must not exceed 1000 characters"),
];
