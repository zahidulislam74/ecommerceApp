const express = require("express");
const {
  getUsers,
  getUser,
  deleteUser,
  processRgister,
  activateUserAccount,
  updateUserById,
} = require("../controllers/userController");
const upload = require("../middlewares/uploadFile");
const { validateUserRegistration } = require("../validators/auth");
const runValidation = require("../validators");
const userRouter = express.Router();

userRouter.post(
  "/process-register",
  upload.single("image"),
  validateUserRegistration,
  runValidation,
  processRgister
);
userRouter.post("/activate", activateUserAccount);
userRouter.get("/", getUsers);
userRouter.get("/:id", getUser);
userRouter.delete("/:id", deleteUser);
userRouter.put("/:id", upload.single("image"), updateUserById);

module.exports = userRouter;
