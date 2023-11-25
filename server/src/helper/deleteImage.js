const fs = require("fs").promises;

const deleteImage = async (userImaePath) => {
  try {
    await fs.access(userImaePath);
    await fs.unlink(userImaePath);
    console.log("user image was deleted successfully");
  } catch (error) {
    console.error("user does not exist");
  }

  //   fs.access(userImaePath)
  //     .then(() => fs.unlink(userImaePath))
  //     .then(() => console.log("user image was deleted successfully"))
  //     .catch((err) => console.error("user does not exist"));
};

module.exports = { deleteImage };
