const fs = require("fs");
const path = require("path");

const stripe = require("stripe")(
  "sk_test_51HIvRrAIOSc4RsI0Zp82J4IBLaksLG6JxE7bD0nb7eZMvYD0JQUbWpcdvt6yr6Qhe6QjJI3Bnesn5eOpCOzQkno700x6c9IMMj"
);

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
// const Cart = require("../models/cart");

const cart = { products: [], totalPrice: 0 };

const ITEMS_PER_PAGE = 1;

// exports.getProducts = (req, res, next) => {
//   Product.fetchAll((products)=>{
//     res.render("shop/product-list", { prods: products, title: "All products", path: "/products" }); // for pug
//   });
// };

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = 0;

  Product.find()
    .countDocuments()
    .then((numProduct) => {
      totalItems = numProduct;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        title: "All products",
        path: "/products",
        nextPage: page + 1,
        currentPage: page,
        previousPage: page - 1,
        hasPreviousPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

// exports.getProduct = (req, res, next) =>{
//   const productId = req.params.productId;
//   Product.getProductFromFile(productId, product=>{
//     res.render("shop/product-detail", { product: product, title: product.title, path: "/products" })
//   });
// }

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        title: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

// exports.getIndex = (req, res, next) => {
//   Product.fetchAll((products)=>{
//     res.render("shop/index", { prods: products, title: "Shop", path: "/" }); // for pug
//   });
// };

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = 0;

  Product.find()
    .countDocuments()
    .then((numProduct) => {
      totalItems = numProduct;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })

    .then((products) => {
      res.render("shop/index", {
        prods: products,
        title: "Shop",
        path: "/",
        nextPage: page + 1,
        currentPage: page,
        previousPage: page - 1,
        hasPreviousPage: page > 1,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

// exports.getCart = (req, res, next) => {
//   req.user.getCart((cart) => {
//     Product.fetchAll((products) => {
//       const cartProducts = [];
//       for (product of products) {
//         const cartProductData = cart.products.find(
//           (prod) => prod.id === product.id
//         );
//         if (cartProductData) {
//           cartProducts.push({ productData: product, qty: cartProductData.qty });
//         }
//       }
//       res.render("shop/cart", {
//         path: "/cart",
//         title: "Your Cart",
//         products: cartProducts,
//       });
//     });
//   });
// };

// exports.getCart = (req, res, next) => {
//   req.user
//     .getCart()
//     .then((cart) => {
//       return cart.getProducts();
//     })
//     .then((products) => {
//       res.render("shop/cart", {
//         path: "/cart",
//         title: "Your Cart",
//         products: products,
//       });
//     })
//     .catch((err) => console.log(err));
// };

exports.getCart = (req, res, next) => {
  const user = req.user;
  user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        title: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

// exports.postCart = (req, res, next) => {
//   const productId = req.body.productId;
//   Product.getProductFromFile(productId, (product) => {
//     Cart.addProduct(product.id, product.price);
//     res.redirect("/cart");
//   });
// };

// exports.postCart = (req, res, next) => {
//   const productId = req.body.productId;
//   let fetchedCart;
//   req.user
//     .getCart()
//     .then((cart) => {
//       fetchedCart = cart;
//       return cart.getProducts({ where: { id: productId } });
//     })
//     .then((products) => {
//       let product;
//       if (products.length > 0) {
//         product = products[0];
//       }
//       if (product) {
//         let newQty = product.cartItem.quantity + 1;
//         return fetchedCart.addProduct(product, {
//           through: { quantity: newQty },
//         });
//       } else {
//         return Product.findByPk(productId)
//           .then((product) => {
//             return fetchedCart.addProduct(product, {
//               through: { quantity: 1 },
//             });
//           })
//           .catch((err) => console.log(err));
//       }
//     })
//     .then(() => res.redirect("/cart"))
//     .catch((err) => console.log(err));
// };

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let user = req.user;
  Product.findById(productId).then((result) => {
    user
      .addToCart(result)
      .then(() => res.redirect("/cart"))
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        //return res.redirect('/500')
      });
  });
};

//
//   var prodId = req.body.productId;
//   req.user
//     .getCart()
//     .then((cart) => cart.getProducts({ where: { id: prodId } }))
//     .then((products) => {
//       let exports.deleteProductFromcart = (req, res, body) => {product = products[0];
//       product.cartItem.destroy();
//     })
//     .then(() => res.redirect("/cart"))
//     .catch((err) => console.log(err));
// };

exports.deleteProductFromcart = (req, res, body) => {
  const user = req.user;
  const prodId = req.body.productId;
  user
    .removeItemFromCart(prodId)
    .then((result) => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

// exports.getOrders = (req, res, next) => {
//   res.render("shop/orders", { title: "Orders", path: "/orders" }); // for pug
// };

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  const user = req.user;
  user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;

      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p=>{
          return {
            name:  p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          }
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      })
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        title: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        title: "Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

// exports.postOrder = (req, res, next) => {
//   let fetchedCart;
//   req.user
//     .getCart()
//     .then((cart) => {
//       fetchedCart = cart;
//       return cart.getProducts();
//     })
//     .then((products) => {
//       req.user.createOrder().then((orders) => {
//         orders.addProduct(
//           products.map((product) => {
//             product.orderItem = { quantity: product.cartItem.quantity };
//             return product;
//           })
//         );
//       });
//     })
//     .then(() => {
//       return fetchedCart.setProducts(null);
//     })
//     .then(() => {
//       res.redirect("/orders");
//     })
//     .catch((err) => console.log(err));
// };

exports.postOrder = (req, res, next) => {
  const user = req.user;
  user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, productData: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          userId: user._id,
        },
        products: products,
      });
      order.save();
    })
    .then((result) => {
      user.cart.items = [];
      return user.save();
    })
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      //return res.redirect('/500')
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.productData.price;
        pdfDoc
          .fontSize(14)
          .text(
            `${prod.productData.title} - ${prod.quantity} * $${prod.productData.price}`
          );
      });
      pdfDoc.text("------------------");
      pdfDoc.fontSize(18).text(`Total Amount - $${totalPrice}`);

      pdfDoc.end();

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader(
      //   "Content-Disposition",
      //   'inline; filename="' + invoiceName + '"'
      // );
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
