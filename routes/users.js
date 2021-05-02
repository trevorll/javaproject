// importing modules
const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware");

// importing controller
const userController = require('../controllers/user');

// user -> dashboard
router.get("/user/:page", middleware.isLoggedIn, userController.getUserDashboard);
router.get("/user/1/notification/:page", middleware.isLoggedIn, userController.getNotification);
router.get("/users/1/chart/:theme/:heading", middleware.isLoggedIn, userController.getChart);
// user -> profile
router.get("/user/1/profile", middleware.isLoggedIn, userController.getUserProfile);

//user -> upload image
router.post("/user/1/image", middleware.isLoggedIn, userController.postUploadUserImage);

//user -> update password
router.put("/user/1/update-password", middleware.isLoggedIn, userController.putUpdatePassword);

//user -> update profile
router.put("/user/1/update-profile", middleware.isLoggedIn, userController.putUpdateUserProfile);

//user -> notification
router.get("/user/1/notification", middleware.isLoggedIn, userController.getNotification);

// user -> borrow a book
router.post("/books/:book_id/borrow/:user_id", middleware.isLoggedIn, userController.postBorrowBook);

//user -> show return-renew page
router.get("/books/return-renew", middleware.isLoggedIn, userController.getReturnRenew);

//user -> renew book
router.post("/books/renew/:book_id/user/:user_id", middleware.isLoggedIn, middleware.isLoggedIn, userController.postRenewBook);

// user -> return book
router.post("/books/return/:book_id/user/:user_id", middleware.isLoggedIn, middleware.isLoggedIn, userController.postReturnBook);

//user -> create new comment
router.post("/user/details/:book_id/comment", middleware.isLoggedIn, userController.postNewComment);

//user -> update existing comment
router.post("/user/details/:book_id/:comment_id", middleware.isLoggedIn, userController.postUpdateComment);

//user -> delete existing comment
router.delete("/user/details/:book_id/:comment_id", middleware.isLoggedIn, userController.deleteComment);

// user -> delete user account
router.delete("/user/1/delete-profile", middleware.isLoggedIn, userController.deleteMyAccount);
router.delete("/user/1/notification/:notification_id", middleware.isLoggedIn, userController.deleteNotification);






module.exports = router;
