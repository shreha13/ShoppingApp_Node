exports.PageNotFound = (req, res, next) => {
  res.status(404).render("404", {
    title: "Page not Found",
    path: "",
    isLoggedIn: req.session.isLoggedIn
  });
};

