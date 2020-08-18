const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    errorMessage: message,
    oldInput: {
      email: "",
    },
  }); //for pug
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    title: "Signup",
    isLoggedIn: false,
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      title: "Login",
      isLoggedIn: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
      },
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.status(422).render("auth/login", {
          path: "/login",
          title: "Login",
          isLoggedIn: false,
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: email,
          },
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(() => {
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          return res.status(422).render("auth/login", {
            path: "/login",
            title: "Login",
            isLoggedIn: false,
            errorMessage: "Invalid email or password.",
            oldInput: {
              email: email,
            },
          });
        })
        .catch((err) => {
          console.log(err);
          return res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      title: "Signup",
      isLoggedIn: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: "",
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPaswd) => {
      const user = new User({
        password: hashedPaswd,
        email: email,
        cart: { items: [] },
      });
      user.save();
    })
    .then(() => {
      res.redirect("/login");
      return transporter
        .sendMail({
          to: email,
          from: "shreyadidwania95@gmail.com",
          subject: "Signup Successful",
          html: "<h1>Sign up succeded!</h1>",
        })
        .catch((err) => console.log(err));
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    title: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, body) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No user with this email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user
          .save()
          .then((result) => {
            res.redirect("/");
            return transporter.sendMail({
              to: req.body.email,
              from: "shreyadidwania13@gmail.com",
              subject: "Reset password",
              html: `
              <p>You have requested for resetting password</p>
              <p>Click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</p>
              `,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  console.log(token);
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      return res.render("auth/new-password", {
        title: "New password",
        path: "/new-password",
        errorMessage: message,
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  let selectedUser;
  User.findOne({
    resetToken: req.body.token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: req.body.userId,
  })
    .then((user) => {
      if (!user) {
        return res.redirect("/reset");
      }
      selectedUser = user;
      return bcrypt
        .hash(req.body.password, 12)
        .then((hashedPaswd) => {
          selectedUser.password = hashedPaswd;
          (selectedUser.resetToken = undefined),
            (selectedUser.resetTokenExpiration = undefined);
          selectedUser.save();
        })
        .then(() => {
          res.redirect("/login");
          return transporter
            .sendMail({
              to: selectedUser.email,
              from: "shreyadidwania13@gmail.com",
              subject: "Password Changed Successful",
              html: "<h1>Password change succeded!</h1>",
            })
            .catch((err) => console.log(err));
        });
    })
    .catch((err) => console.log(err));
};
