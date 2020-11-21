// importing libraries
const passport = require('passport');

// importing models
const User = require('../models/user');
const Admin = require('../models/admin');

exports.getLandingPage = (req, res, next) => {
    res.render('landing');
}

exports.getAdminLoginPage = (req, res, next) => {
    res.render("admin/adminLogin");
}

exports.getAdminLogout = (req, res, next) => {
    req.logout();
    res.redirect("/");
}

exports.getAdminSignUp = (req, res, next) => {
    res.render("signup");
}
//
exports.postAdminSignUp = async(req, res, next) => {
    try {
        if(req.body.adminCode == "te amor") {
            const newAdmin = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username : req.body.username,
                email : req.body.email,
                isAdmin: true,
            });

            const admin = await User.register(newAdmin, req.body.password);
            await passport.authenticate("local")(req, res, () => {
                req.flash("success", "Hello, " + admin.username + " Welcome to Admin Dashboard");
                res.redirect("/admin");
            });
        }
    } catch(err) {
        console.log(err);
        req.flash("error", "Given info matches someone registered as Admin. Please provide different info for registering as Admin");
        return res.render("signup");
    }
}

exports.getUserLoginPage = (req, res, next) => {
    res.render("user/userLogin");
}

exports.getUserLogout = (req, res, next) => {
    req.logout();
    res.redirect("/");
}

exports.getUserSignUp = (req, res, next) => {
    res.render("user/userSignup");
}

exports.postUserSignUp = async(req, res, next) => {
  let imageUrl;
  if(req.file) {
      imageUrl = `${uid()}_${req.file.originalname}`;
      let filename = `images/${imageUrl}`;
      await sharp(req.file.path)
          .rotate()
          .resize(500, 500)
          .toFile(filename);

      fs.unlink(req.file.path, err => {
          if(err) {
              console.log(err);
          }
      })
  }

  url = imageUrl;

    try {
        const newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            username : req.body.username,
            email : req.body.email,
            // gender : req.body.gender,
            // address : req.body.address,
            image : "",
         });

         await User.register(newUser, req.body.password);
         await passport.authenticate("local")(req, res, () => {
            res.redirect("/user/1")
         });
    } catch(err) {
        console.log(err);
        return res.render("user/userSignup");
    }
}
