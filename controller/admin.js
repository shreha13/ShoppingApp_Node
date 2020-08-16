const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
    editing: false,
  }); //for pug
};

// exports.postAddProduct = (req, res, next) => {
//   const product = new Product(
//     null,
//     req.body.title,
//     req.body.imageUrl,
//     req.body.description,
//     req.body.price
//   );
//   product.save();
//   res.redirect("/admin/products");
// };

exports.postAddProduct = (req, res, next) => {
  let title = req.body.title;
  let description = req.body.description;
  let price = req.body.price;
  let imageUrl = req.body.imageUrl;
  // req.user.createProduct({
  //   title: req.body.title,
  //   description: req.body.description,
  //   price: req.body.price,
  //   imageUrl: req.body.imageUrl,
  // })\
  // const product = new Product(
  //   title,
  //   price,
  //   description,
  //   imageUrl,
  //   null,
  //   req.user._id
  // );
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

// exports.getEditProduct = (req, res, next) => {
//   var editMode = req.query.edit;
//   const productId = req.params.productId;
//   Product.findByPk(productId)
//   .then(product=>{
//     if(!product){
//       res.redirect("/admin/add-product");
//     }
//     res.render("admin/edit-product", {
//       title: "Edit Product",
//       path: "/admin/edit-product",
//       editing: editMode,
//       product: product,
//     });
//   })
//   .catch(err => console.log(err))
// };

exports.getEditProduct = (req, res, next) => {
  var editMode = req.query.edit;
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        res.redirect("/admin/add-product");
      }
      res.render("admin/edit-product", {
        title: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

// exports.postEditProduct = (req, res, next) => {
//   const product = new Product(
//     req.body.productId,
//     req.body.title,
//     req.body.imageUrl,
//     req.body.description,
//     req.body.price
//   );
//   product.save();
//   res.redirect("/admin/products");
// };

// exports.postEditProduct = (req, res, next) => {
//   const product = new Product(
//     req.body.productId,
//     req.body.title,
//     req.body.imageUrl,
//     req.body.description,
//     req.body.price
//   );
//   Product.findByPk(req.body.productId)
//   .then(product =>{
//     product.title = req.body.title;
//     product.description = req.body.description;
//     product.price = req.body.price;
//     product.imageUrl = req.body.imageUrl;
//     return product.save();
//   })
//   .then(() => res.redirect("/admin/products"))
//   .catch(err => console.log(err))
// };

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  // const product = new Product(
  //   req.body.title,
  //   req.body.price,
  //   req.body.description,
  //   req.body.imageUrl,
  //   req.body.productId,
  //   req.user._id
  // );

  Product.findOne({ _id: productId, userId: req.user._id })
    .then((product) => {
      if (product) {
        product.title = req.body.title;
        product.price = req.body.price;
        product.description = req.body.description;
        product.imageUrl = req.body.imageUrl;
        product.save();
      }
    })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

// exports.deleteProduct = (req, res, next) => {
//   const productId = req.body.productId;
//   Product.delete(productId);
//   res.redirect("/admin/products");
// };

// exports.deleteProduct = (req, res, next) => {
//   const productId = req.body.productId;
//   Product.destroy({where:{
//     id: productId
//   }})
//   .then(() => res.redirect("/admin/products"))
//   .catch(err => console.log(err))
// };

exports.deleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

// exports.getProducts = (req, res, next) => {
//   Product.fetchAll((products) => {
//     res.render("admin/products", {
//       prods: products,
//       title: "Products",
//       path: "/admin/products",
//     }); // for pug
//   });
// };

// exports.getProducts = (req, res, next) => {
//   Product.fetchAll()
//     .then(([data]) => {
//       res.render("admin/products", {
//         prods: data,
//         title: "All products",
//         path: "/admin/products",
//       });
//     })
//     .catch((err) => console.log(err));
// };

// exports.getProducts = (req, res, next) => {
//   req.user.getProducts()
//     .then((products) => {
//       res.render("admin/products", {
//         prods: products,
//         title: "All products",
//         path: "/admin/products",
//       });
//     })
//     .catch((err) => console.log(err));
// };

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        title: "All products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.log(err));
};
