const express = require("express"),
      router = express.Router(),
      passport = require('passport');


// Import index controller
const authController = require('../controllers/auth');

// Import models
const User = require("../models/user");
const Admin = require("../models/admin");
// const { route } = require("./users");

//landing page
router.get('/', authController.getLandingPage);

//admin login handler
router.get("/auth/admin-login", authController.getAdminLoginPage);


router.post("/auth/admin-login", passport.authenticate("local", {
        successRedirect : "/admin",
        failureRedirect : "/auth/admin-login",
    }), (req, res)=> {
});

// admin logout handler
router.get("/auth/admin-logout", authController.getAdminLogout);


// admin sign up handler
router.get("/auth/admin-signup", authController.getAdminSignUp);

router.post("/auth/admin-signup", authController.postAdminSignUp);

//user login handler
router.get("/auth/user-login", authController.getUserLoginPage);

router.post("/auth/user-login", passport.authenticate("local", {
        successRedirect : "/user/1",
        failureRedirect : "/auth/user-login",
    }), (req, res)=> {
});

//user -> user logout handler
router.get("/auth/user-logout", authController.getUserLogout);

//user sign up handler
router.get("/auth/user-signUp", authController.getUserSignUp);

router.post("/auth/user-signup", authController.postUserSignUp);

//reset password handler
router.get("/auth/resetPassword", authController.getResetPassword);
router.post("/auth/resetPassword", authController.postResetPassword);
router.post("/auth/reset", authController.postReset);
router.get("/auth/reset", authController.getReset);
router.post("/auth/reset", authController.postReset);

module.exports = router;
