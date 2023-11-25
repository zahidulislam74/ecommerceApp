require("dotenv").config();

const port = process.env.PORT || 3002;
const url = process.env.URL;
const defaultImagePath =
  process.env.DEFAULT_USER_IMAGE_PATH || "public/images/users/default.png";

const jwtActivaionKey =
  process.env.JWT_ACTIVATION_KEY || "sdwefwfsdfsdferf123cd";
const jwtAccessKey = process.env.JWT_ACCESS_KEY || "ACCESS_KEY";
const smtpUsername = process.env.SMTP_USERNAME || "";
const smtpPassword = process.env.SMTP_PASSWORD || "";
const clientUrl = process.env.CLIENT_URL || "";
// const uploadDir = process.env.UPLOAD_FILE || "public/images/users";
module.exports = {
  port,
  url,
  defaultImagePath,
  jwtActivaionKey,
  smtpUsername,
  smtpPassword,
  clientUrl,
  jwtAccessKey,
};
