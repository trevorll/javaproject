const fs = require("fs");


const Book = require("../models/book");
const User = require("../models/user");


const deleteImage = require("../utils/delete_image");

const PER_PAGE = 10;

exports.getDashboard = async(req, res, next) => {
  var page = req.query.page || 1;
  try{
    const users_count = await User.find().countDocuments();
    const book_count = await Book.find().countDocuments();


    res.render("admin/index", {
      users_count: users_count,
      book_count: book_count,
      current: page,
      pages: Math.ceil(users_count / PER_PAGE)
    });
  } catch(err) {
    console.log(err)
  }
}

exports.getAddNewBook = (req, res, next) => {
  res.render("admin/addbook")
}
exports.postAddNewBook = async(req, res, next) => {
  try{
    const book_info = req.body.book;
    book_info.description = req.sanitize(book_info.description);

    const isDuplicate = await Book.find(book_info);

    if(isDuplicate.length > 0){
      req.flash("error", "the book  already exists in the database");
      return res.redirect('back');
    }
    const new_book = new Book(book_info);
    await new_book.save();
    req.flash("success", "You have added ${new_book.title} to the inventory");
    res.redirect("/admin/bookInventory/all/all/1");
  } catch(err) {
    console.log(err)
    res.redirect('back');
  }
}
