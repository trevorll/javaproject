const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      middleware = require("../middleware"),
      User= require("../models/user"),
      Book = require("../models/book");
      Activity = require("../models/activity"),
      Issue = require("../models/issue"),
      Comment = require("../models/comment");
      Request = require("../models/request");



const adminController = require('../controllers/admin');


//gets admin dashboard
router.get("/admin",middleware.isAdmin, adminController.getDashboard);
router.post("/admin/:page",middleware.isAdmin, adminController.postDashboard);


//gets and posts a new book
router.get("/admin/books/add", middleware.isAdmin, adminController.getAddNewBook);
router.post("/admin/books/add", middleware.isAdmin, adminController.postAddNewBook);

//gets the admin requests
router.get("/admin/requests", middleware.isAdmin, adminController.getAdminRequests);

//Get user info
router.get("/admin/userinfo/:user_id", middleware.isAdmin, adminController.getuserinfo);
 //issue a book
router.post("/admin/grant/borrow/:request_id", middleware.isAdmin, adminController.postIssueBook);
//admin renew book
router.get("/admin/renew/request/:request_id/book/:book_id/user/:user_id", middleware.isAdmin, adminController.getRenewBook);
//admin decline request
router.delete("/admin/decline/request/:request_id/book/:book_id/user/:user_id", middleware.isAdmin, adminController.deleteDeclineRequest);
//Grant user return book
router.post("/admin/return/request/:request_id/book/:book_id/user/:user_id", middleware.isAdmin, adminController.postReturnBook);
//grant delete user Profile
router.post("/admin/delete/request/:request_id/user/:user_id", middleware.isAdmin, adminController.deleteUserAccount);
//get all users
router.get("/admin/users/:page", middleware.isAdmin, adminController.getUsers);


//get the information of one user
router.post("/admin/user/:page", middleware.isAdmin, adminController.postSearchUser);

router.get("/admin/user/:user_id", middleware.isAdmin, adminController.getUserProfile);


//get the user inventory
router.get("/admin/bookInventory/:filter/:value/:page", middleware.isAdmin, adminController.getAdminBookInventory);
router.post("/admin/bookInventory/:filter/:value/:page", middleware.isAdmin, adminController.postAdminBookInventory);

//get flag user
router.get("/admin/users/flagged/:user_id", middleware.isAdmin, adminController.getFlagUser);



module.exports = router;
