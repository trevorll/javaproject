const express = require("express"),
      router = express.Router();

const bookController = require('../controllers/other');

router.get("/other/:filter/:value/:page", bookController.getBooks);

router.post("/other/:filter/:value/:page", bookController.findBooks);

router.get("/other/details/:book_id", bookController.getBookDetails);




module.exports = router;
