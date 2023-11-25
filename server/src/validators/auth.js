const { body } = require("express-validator");
// registration validation
const validateUserRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 31 })
    .withMessage("Name should be between 3 and 31 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password should be  6 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password should be contain one uppercase letter, one lowercase letter, one number and one special character"
    ),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  // body("image").optional().isString().withMessage("Name is required"),
  body("image")
    .custom((value, { req }) => {
      if (!req.file || !req.file.buffer) {
        throw new Error(" User Image is required");
      }
      return true;
    })
    .withMessage("User Image is required"),
];
// sign in validation

module.exports = { validateUserRegistration };
