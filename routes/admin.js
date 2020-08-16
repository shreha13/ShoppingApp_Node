const path = require('path');

const express = require('express');

const adminController = require('../controller/admin')
const rootDir = require('../util/path');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.get('/products', adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', adminController.postAddProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.deleteProduct);

module.exports = router;
