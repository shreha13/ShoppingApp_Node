exports.PageNotFound = (req, res, next) => {
  const isLoggedIn = req.session.isLoggedIn;
  res.status(404).render("404", {
    title: "Page not Found",
    path: "",
    isLoggedIn: isLoggedIn,
  });
};
