const mongoose = require("mongoose");
const { url } = require("../secret");

const connectDB = async (options = {}) => {
  try {
    await mongoose.connect(url, options);
    console.log("connection to db is successful");
    mongoose.connection.on("error", (error) => {
      console.error("DB connection error : ", error);
    });
  } catch (error) {
    console.error("Could not connect to db : ", error.toString());
  }
};

module.exports = connectDB;
