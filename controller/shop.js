const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
// const Cart = require("../models/cart");

const cart = { products: [], totalPrice: 0 };


// exports.getProducts = (req, res, next) => {
//   Product.fetchAll((products)=>{
//     res.render("shop/product-list", { prods: products, title: "All products", path: "/products" }); // for pug
//   });
// };

exports.getProducts = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        title: "All products",
        path: "/products",
        isLoggedIn: isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

// exports.getProduct = (req, res, next) =>{
//   const productId = req.params.productId;
//   Product.getProductFromFile(productId, product=>{
//     res.render("shop/product-detail", { product: product, title: product.title, path: "/products" })
//   });
// }

exports.getProduct = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        title: product.title,
        path: "/products",
        isLoggedIn: isLoggedIn
      });
    })
    .catch((err) => console.log(err));
};

// exports.getIndex = (req, res, next) => {
//   Product.fetchAll((products)=>{
//     res.render("shop/index", { prods: products, title: "Shop", path: "/" }); // for pug
//   });
// };

exports.getIndex = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        title: "Shop",
        path: "/",
        isLoggedIn: isLoggedIn
      });
    })
    .catch((err) => console.log(err));
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
  const isLoggedIn = req.session.isLoggedIn;
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
        isLoggedIn: isLoggedIn
      });
    })
    .catch((err) => console.log(err));
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
      .catch((err) => console.log(err));
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
    .catch((err) => console.log(err));
};

// exports.getOrders = (req, res, next) => {
//   res.render("shop/orders", { title: "Orders", path: "/orders" }); // for pug
// };

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", { title: "Checkout", path: "/checkout" }); // for pug
};

exports.getOrders = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  Order
    .find({"user.userId": req.user._id})
    .then((orders) => {
      res.render("shop/orders", {
        title: "Orders",
        path: "/orders",
        orders: orders,
        isLoggedIn: isLoggedIn
      });
    })
    .catch((err) => console.log(err));
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
          name: user.name,
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
    .catch((err) => console.log(err));
};
