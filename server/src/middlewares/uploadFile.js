// const express = require("express");
const multer = require("multer");
// const path = require("path");
// const createError = require("http-errors");////--->UPLOAD_FILE,

const { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } = require("../config");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, UPLOAD_FILE);
//   },
//   filename: function (req, file, cb) {
//     const extname = path.extname(file.originalname);
//     cb(
//       null,
//       Date.now() + "-" + file.originalname.replace(extname, "") + extname
//     );
//   },
// });
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // const extname = path.extname(file.originalname);
  // if (!ALLOWED_FILE_TYPES.includes(extname.substring(1))) {
  //   return cb(new Error("File type not allowed"), false);
  // }
  // cb(null, true);
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  if (file.size > MAX_FILE_SIZE) {
    return cb(new Error("file size acceed the maximum limit"), false);
  }
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return cb(new Error("file extention is not allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  // limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter,
});

module.exports = upload;
