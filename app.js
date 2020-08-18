const path = require("path");

const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoDBSession = require("connect-mongodb-session")(session);
//const expressHbs = require('express-handlebars')

const errorController = require("./controller/error");
// const mongoConnect = require('./util/database').mongoConnect;
// const sequelize = require("./util/database");
// const Product = require("./models/product");
const User = require("./models/user");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");
// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");

const MONGODB_URI =
  "mongodb+srv://shreha:IAtsWXsiAfKIvkSX@cluster0.u5mts.mongodb.net/shop";

const app = express();
const store = new mongoDBSession({
  uri: MONGODB_URI,
  collection: "sessions",
});

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString + `-${file.originalname}`);
//   },
// });

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
   cb(null, 'images')
  },
  filename: (req, file, cb) => {
   cb(null, new Date().toDateString() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  console.log(file.mimetype)
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image.jpg" ||
    file.mimetype === "image/jpeg"
  ) {
   cb(null, true);
  } else {
    cb(null, false);
  }
};

//app.engine('hbs', expressHbs({layoutsDir:'views/layouts', defaultLayout:'main-layout', extname:'hbs'}));

//app.set('view engine', 'hbs');

app.set("view engine", "ejs");
//app.set('view engine', 'pug');
app.set("views", "views");

const adminRoute = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const csrfProtection = csrf();
app.use(csrfProtection);

app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => next(new Error(err)));
});

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoute);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.PageNotFound);

app.use((error, req, res, next) => {
  return res.status(500).render("500", {
    title: "Error",
    path: "/500",
    isLoggedIn: req.session.isLoggedIn,
  });
});

// Product.belongsTo(User, { constraint: true, onDelete: "CASCADE" });
// User.hasMany(Product);
// User.hasOne(Cart);
// User.hasMany(Order);
// Order.belongsTo(User);
// Order.belongsToMany(Product, { through: OrderItem });
// Product.belongsToMany(Order, { through: OrderItem });
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });

// sequelize
//   .sync()
//   .then(() => {
//     return User.findByPk(1);
//   })
//   .then((user) => {
//     if (!user) {
//       return User.create({
//         name: "shreya",
//         email: "shreyadidwania95@gmail.com",
//       });
//     }
//     return user;
//   })
//   .then((user) => user.createCart())
//   .then((cart) => app.listen(3000))
//   .catch((err) => console.log(err));

// mongoConnect(client =>{
//   app.listen(3000);
// })

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
