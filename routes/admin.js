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
const { route } = require("./users");
const userController = require("../controllers/user");


//gets admin dashboard
router.get("/admin",middleware.isAdmin, adminController.getDashboard);
router.post("/admin/:page",middleware.isAdmin, adminController.postDashboard);
router.get("/admin/users/chart/:theme/:heading", middleware.isAdmin, adminController.getChart);
router.get("/admin/users/activities/chart/:theme/:heading", middleware.isAdmin, adminController.getActivitiesChart);
router.get("/admin/users/chart/:type", middleware.isAdmin, adminController.getChart);


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
//delete userrequest to delete the account
router.delete("/admin/delete/request/:requestid/user/:userid", middleware.isAdmin, adminController.postDeleteRequest);
//Grant user return book
router.post("/admin/return/request/:request_id/book/:book_id/user/:user_id", middleware.isAdmin, adminController.postReturnBook);
//grant delete user Profile
router.post("/admin/delete/request/:request_id/user/:user_id", middleware.isAdmin, adminController.deleteUserAccount);
router.get("/admin/users/delete/:user_id", middleware.isAdmin, adminController.deleteUser)
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
//payment rout
router.put("/admin/user/payment", middleware.isAdmin, adminController.putFineUser);
router.get("/admin/fine/users", middleware.isAdmin, adminController.getTotalFines);

//admin -> update book
router.post("/admin/book/update/:book_id", middleware.isAdmin, adminController.postUpdateBook);
router.get("/admin/book/update/:book_id", middleware.isAdmin, adminController.getUpdateBook);
router.post("/admin/details/:book_id/comment", middleware.isAdmin, adminController.postNewComment);
router.post("/admin/details/:book_id/:comment_id", middleware.isAdmin, adminController.postUpdateComment);
router.delete("/admin/details/:book_id/:comment_id", middleware.isAdmin, adminController.deleteComment);
//show more
router.get("/admin/users/activities/:user_id/:page", middleware.isAdmin, adminController.getUserAllActivities);
router.post("/admin/users/activities/:user_id/:page", middleware.isAdmin, adminController.postShowActivitiesByCategory);
router.get("/admin/users/activity/:user_id/:category/:page", middleware.isAdmin, adminController.postShowActivitiesByCategory);
router.post("/admin/users/activity/:user_id/:category/:page", middleware.isAdmin, adminController.postShowActivitiesByCategory);



module.exports = router;
