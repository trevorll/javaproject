const multer = require("multer");

const middleware = {};

middleware.isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You should be logged in first");
  res.redirect("/");
};
middleware.isAdmin = function(req, res, next) {
  if(req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  else if(req.isAuthenticated() && !req.user.isAdmin){
    req.flash("error", "Sorry you are not an admin")
    res.redirect("/auth/admin-login");
  }

};

middleware.upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  }
});

module.exports = middleware;
