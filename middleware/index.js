const multer = require("multer");

const middleware = {};

middleware.isLoggedIn = function(req, res, next) {
  if(!req.isAuthenticated()) {
    req.flash("error", "Please provide the right credentials");
    return res.redirect("back")
  }else if(req.isAuthenticated() && req.user.isAdmin) {
    req.flash("error","Sorry this page is  for admins only");
    return res.redirect('back');
  }else if(req.isAuthenticated()) {
      return next();
    }else{
      req.flash("error", "You should be logged in first");
      res.redirect("/");
    }
};
middleware.isAdmin = function(req, res, next) {
  if(!(req.isAuthenticated())) {
    req.flash("error", "Please provide the right credentials");
    return res.redirect("back")
  } else if(req.isAuthenticated() && !req.user.isAdmin){
    req.flash("error", "Sorry you are not an admin")
    res.redirect("back");
  }else if(req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }

};

middleware.upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  }
});

module.exports = middleware;
