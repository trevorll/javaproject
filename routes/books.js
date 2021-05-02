const express = require("express"),
      router = express.Router();

const bookController = require('../controllers/books');
const middleware = require("../middleware");

router.get("/books/:filter/:value/:page", middleware.isLoggedIn, bookController.getBooks);

router.post("/books/:filter/:value/:page", middleware.isLoggedIn, bookController.findBooks);

router.get("/books/details/:book_id", middleware.isLoggedIn, bookController.getBookDetails);




module.exports = router;
