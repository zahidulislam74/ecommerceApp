const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { successResponse } = require("./responseController");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const { jwtAccessKey } = require("../secret");

const handleLogin = async (req, res, next) => {
  try {
    // email, password from req.body
    const { email, password } = req.body;
    // is exists
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(
        404,
        "User with this email does not exist, please register first"
      );
    }
    // compare the password
    const isPaswordMatch = await bcrypt.compare(password, user.password);
    if (!isPaswordMatch) {
      throw createError(401, "email or password is incorrect");
    }
    // isBanned
    if (user.isBanned) {
      throw createError(401, "you are banned, please contact admin");
    }
    // token, cookie
    // create jwt token
    const accessToken = createJsonWebToken({}, jwtAccessKey, "10m");
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 24,
      sameSite: "none",
      secure: true,
    });
    return successResponse(res, {
      statusCode: 200,
      message: "user is logged in successfully",
      payload: { user },
    });
  } catch (error) {
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    return successResponse(res, {
      statusCode: 200,
      message: "user is logged out successfully",
      payload: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleLogin, handleLogout };
