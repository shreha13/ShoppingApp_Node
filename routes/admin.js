const path = require('path');

const express = require('express');

const adminController = require('../controller/admin')
const rootDir = require('../util/path');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.deleteProduct);

module.exports = router;
