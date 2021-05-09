// importing libraries
const passport = require('passport');

// importing models
const User = require('../models/user');
const Admin = require('../models/admin');
const Activity = require("../models/activity");
const Notification = require("../models/notifications");
const user = require('../models/user');

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
                res.redirect("back");;
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
            gender : req.body.gender,
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
exports.getReset = (req, res, next) =>{
	res.render("reset");
}

exports.postReset = async(req, res, next) => {
        const user = await User.findOne({username: req.body.username});
        if(!user){
            req.flash("error", "user does not exist");
            res.redirect("back")
        }
        return res.render("resetPassword", {
            username:user.username,
            email: user.email
        });
    }
exports.getResetPassword = (re, res, next) =>{
	res.render("resetPassword");
}
exports.postResetPassword = async(req, res, next) => {
	const username = req.body.username;
  	const vemail = req.body.email;
  	const newPassword = req.body.password;
  	const confirmPassword = req.body.confirmPassword;
   	if(confirmPassword != newPassword){
     		req.flash("error", "passwords dont match!");
     		res.redirect("back");
   	}else{
           try{
                const user = await User.findOne({username:username});
                const email= user.email;
                    if(vemail != email){
                        req.flash("error", "provide the correct email!");
                        res.redirect("back");
                }
                await user.setPassword(req.body.password);
                await user.save()
                console.log(user._id);


                const activity = new Activity({
                    category: "Reset Password",
                    user_id : {
                        id: user._id,
                        username: user.username,
                    }
                });
                await activity.save();

                const notification = new Notification({
                    category: "Reset Password",
                    user_id: {
                        id: user._id,
                        username: user.username,
                    }
                })
                await notification.save();
                req.flash("success", "Your has been successfully reset. please log in again to confirm");
                res.redirect("/auth/user-login");

                }catch(err) {
                        console.log(err);
                        return res.redirect("back")
                }
	}
}
	


