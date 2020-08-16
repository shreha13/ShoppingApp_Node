const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  //const isLoggedIn = req.get("Cookie").split(";")[0].trim().split("=")[1];
  const isLoggedIn = req.session.isLoggedIn;
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    isLoggedIn: isLoggedIn,
  }); //for pug
};

exports.postLogin = (req, res, next) => {
  User.findById("5f379166e7a51d2538d05f38")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(()=>{
        return res.redirect("/")
      })
      ;
    })
   .catch((err) => console.log(err)); 
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
