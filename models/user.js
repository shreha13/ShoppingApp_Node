const mongoose = require("mongoose");
const { schema } = require("./product");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  orders: {
    items: [{}],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() == product._id.toString();
  });
  let newQty = 1;
  let updatedCartItem = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQty = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItem[cartProductIndex].quantity = newQty;
  } else {
    updatedCartItem.push({
      productId: product._id,
      quantity: newQty,
    });
  }
  const updatedCart = { items: updatedCartItem };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeItemFromCart = function (productId) {
  const updatedItems = this.cart.items.filter(
    (i) => i.productId.toString() !== productId.toString()
  );
  this.cart.items = updatedItems;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const getDb = require("../util/database").getDb;

// const mongodb = require("mongodb");

// class User {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db
//       .collection("users")
//       .insertOne(this)
//       .then((result) => {
//         return result;
//       })
//       .catch((err) => console.log(err));
//   }

//   addToCart(product) {
//     const db = getDb();
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() == product._id.toString();
//     });
//     let newQty = 1;
//     let updatedCartItem = [...this.cart.items];
//     if (cartProductIndex >= 0) {
//       newQty = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItem[cartProductIndex].quantity = newQty;
//     } else {
//       updatedCartItem.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: newQty,
//       });
//     }
//     const updatedCart = { items: updatedCartItem };
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       )
//       .catch((err) => console.log(err));
//   }

//   getCart() {
//     const db = getDb();
//     let productIds = this.cart.items.map((i) => i.productId);
//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           return {
//             ...p,
//             quantity: this.cart.items.find((i) => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity,
//           };
//         });
//       })
//       .catch((err) => console.log(err));
//   }

//   deleteProductFromcart(productId) {
//     const db = getDb();
//     const updatedItems = this.cart.items.filter(
//       (i) => i.productId.toString() !== productId.toString()
//     );
//     const updatedCart = { items: updatedItems };
//     return db
//       .collection("users")
//       .updateOne({ _id: this._id }, { $set: { cart: updatedCart } })
//       .then((res) => {
//         return res;
//       })
//       .catch((err) => console.log(err));
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             userId: new mongodb.ObjectId(this._id),
//             name: this.name,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then((result) => {
//         this.cart = { items: [] };
//         return db
//           .collection("users")
//           .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } })
//           .then((res) => {
//             return res;
//           })
//           .catch((err) => console.log(err));
//       })
//       .catch((err) => console.log(err));
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user.userId": new mongodb.ObjectId(this._id) })
//       .toArray()
//       .then((result) => {
//         return result;
//       })
//       .catch((err) => console.log(err));
//   }

//   static fetchById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .findOne({ _id: new mongodb.ObjectId(userId) });
//   }
// }

// module.exports = User;
