const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
// const mongoose = require("mongoose");
const { findWithId } = require("../services/findItem");
const { deleteImage } = require("../helper/deleteImage");
const { createJsonWebToken } = require("../helper/jsonwebtoken");
const { jwtActivaionKey, clientUrl } = require("../secret");
const sendEmail = require("../helper/email");

const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    //searching user by name, email, password
    const searchRegExp = new RegExp(".*" + search + ".*", "i");
    const filter = {
      isAdmin: { $ne: true },
      $or: [
        { name: { $regex: searchRegExp } },
        { email: { $regex: searchRegExp } },
        { phone: { $regex: searchRegExp } },
      ],
    };
    const options = { password: 0 };

    const users = await User.find(filter, options)
      .limit(limit) // limit users in pages
      .skip((page - 1) * limit); //skipp previous page users

    const count = await User.find(filter).countDocuments(); // how many users are there
    if (!users) throw createError(404, "no Users found");

    return successResponse(res, {
      statusCode: 200,
      message: "users were returned",
      payload: {
        users,
        pagination: {
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          previousPage: page - 1 > 0 ? page - 1 : null,
          nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);
    // const user = await User.findById(id, options);
    // if (!user) {
    //   throw createError(404, "user does not exist with this id");
    // }

    return successResponse(res, {
      statusCode: 200,
      message: "users is returned",
      payload: { user },
    });
  } catch (error) {
    // if (error instanceof mongoose.Error) {
    //   next(createError(400, "Invalid user id"));
    //   return;
    // }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const options = { password: 0 };
    const user = await findWithId(User, id, options);

    const userImaePath = user.image;

    deleteImage(userImaePath);

    // fs.access(userImagePath, (err) => {
    //   if (err) {
    //     console.error("user does not exist");
    //   } else {
    //     fs.unlink(userImaePath, (err) => {
    //       if (err) throw err;
    //     });
    //   }
    // });

    await User.findByIdAndDelete({
      _id: id,
      isAdmin: false,
    });

    return successResponse(res, {
      statusCode: 200,
      message: "user is deleted",
    });
  } catch (error) {
    next(error);
  }
};

const processRgister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const image = req.file;
    if (!image) {
      throw createError(400, "Image file is requird");
    }
    if (image.size > 1024 * 1024 * 2) {
      throw createError(400, "File is too large. It must be 2 mb");
    }

    const imageBufferString = image.buffer.toString("base64");

    const userExists = await User.exists({ email: email });
    if (userExists) {
      throw createError(
        409,
        "User with this email already exists. Please sign in"
      );
    }
    // create jwt token
    const token = createJsonWebToken(
      { name, email, password, phone, address, image: imageBufferString },
      jwtActivaionKey,
      "10m"
    );
    // prepare email
    const emailData = {
      email,
      subject: "Acoounts Activation Email",
      html: `
        <h2>Hello ${name} !</h2>
        <p>pleaes click here to <a href="${clientUrl}/api/users/activate/${token}" target="_blank">activate your account</a></p>
      `,
    };

    // send email with nodemailer
    try {
      await sendEmail(emailData);
    } catch (error) {
      next(createError(500, "failed to send varification email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `plese go to your ${email} for completing your registration process`,
      payload: { token },
    });
  } catch (error) {
    next(error);
  }
};

const activateUserAccount = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) throw createError(404, "token not found");
    try {
      const decoded = jwt.verify(token, jwtActivaionKey);
      if (!decoded) throw createError(401, "user was not verified");
      // console.log(decoded);

      const userExists = await User.exists({ email: decoded.email });
      if (userExists) {
        throw createError(
          409,
          "User with this email already exists. Please sign in"
        );
      }

      await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: "user is registered successfully",
        // payload: { user },
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const options = { password: 0 };
    await findWithId(User, userId, options);
    const updateOptions = { new: true, runValidators: true, context: "query" };
    let updates = {};

    // if (req.body.name) {
    //   updates.name = req.body.name;
    // }
    // if (req.body.password) {
    //   updates.password = req.body.password;
    // }
    // if (req.body.phone) {
    //   updates.phone = req.body.phone;
    // }
    // if (req.body.address) {
    //   updates.address = req.body.address;
    // }

    for (let key in req.body) {
      if (["name", "password", "phone", "address"].includes(key)) {
        updates[key] = req.body[key];
      } else if (["email"].includes(key)) {
        throw createError(400, "Email can not be updated");
      }
    }

    const image = req.file;
    if (image) {
      if (image.size > 1024 * 1024 * 2) {
        throw createError(400, "File is too large. It must be 2 mb");
      }
      updates.image = image.buffer.toString("base64");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      updateOptions
    ).select("-password");

    if (!updatedUser) {
      throw createError(404, "User with this id does not exist");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "user is updated successfully",
      payload: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  deleteUser,
  processRgister,
  activateUserAccount,
  updateUserById,
};
