const express = require("express"),
      router = express.Router(),
      passport = require("passport"),
      middleware = require("../middleware"),
      User= require("../models/user"),
      Book = require("../models/book");



const adminController = require('../controllers/admin');

router.get("/admin",middleware.isAdmin, adminController.getDashboard);

router.get("/admin/books/add", middleware.isAdmin, adminController.getAddNewBook);
router.post("/admin/books/add", middleware.isAdmin, adminController.postAddNewBook);

module.exports = router;
