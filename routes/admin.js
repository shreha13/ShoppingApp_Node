const path = require("path");

const express = require("express");
const { body } = require("express-validator/check");

const adminController = require("../controller/admin");
const rootDir = require("../util/path");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.get("/products", isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post(
  "/add-product",
  [
    body(
      "title",
      "Title field should only have numbers and characters atleast 3 character long"
    )
      .isAlphanumeric()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description field should atleast be 5 character long")
      .trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.post(
  "/edit-product",
  [
    body(
      "title",
      "Title field should only have numbers and characters atleast 3 character long"
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description")
      .isLength({ min: 5 })
      .withMessage("Description field should atleast be 5 character long")
      .trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.deleteProduct);

module.exports = router;
