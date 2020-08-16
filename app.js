const path = require("path");

const mongoose = require("mongoose");

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

//app.engine('hbs', expressHbs({layoutsDir:'views/layouts', defaultLayout:'main-layout', extname:'hbs'}));

//app.set('view engine', 'hbs');

app.set("view engine", "ejs");
//app.set('view engine', 'pug');
app.set("views", "views");

const adminRoute = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoute);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.PageNotFound);

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
    User.findOne().then((users) => {
      if (!users) {
        const user = new User({
          name: "Shreya",
          email: "shreyadidwania95@gmail.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(3000);
  })
  .catch((err) => console.log(err));
