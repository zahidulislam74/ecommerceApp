const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { defaultImagePath } = require("../secret");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "user name is required"],
      trim: true,
      minlength: [3, "shuld be minimum 3 charecters required"],
      maxlength: [31, "shuld be maximum 31 charecters "],
    },
    email: {
      type: String,
      required: [true, "user email is required"],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "user password is required"],
      minlength: [6, "password shuld be minimum 6 charecters length"],
      set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)),
    },
    image: {
      // type: String,
      // default: defaultImagePath,
      type: Buffer,
      contentType: String,
      required: [true, "user image is required"],
    },
    address: {
      type: String,
      required: [true, "user address is required"],
    },
    phone: {
      type: String,
      required: [true, "user phone is required"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model("users", userSchema);
module.exports = User;
