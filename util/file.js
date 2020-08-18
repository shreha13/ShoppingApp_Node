const fs = require("fs");

const deleteProduct = (filePath) => {
  return fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteProduct = deleteProduct;
