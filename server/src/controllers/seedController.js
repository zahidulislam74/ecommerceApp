const data = require("../data");
const User = require("../models/userModel");

const seedUser = async (req, res, next) => {
  try {
    // deleting all users
    await User.deleteMany({});

    //inserting a new user
    const users = await User.insertMany(data.users);
    return res.status(201).json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { seedUser };
