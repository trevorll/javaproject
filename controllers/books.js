const Book = require('../models/book');
const Request = require('../models/request');
const Notification = require('../models/notifications');
const PER_PAGE = 16;



exports.getBooks = async(req, res, next) => {
  const count_requests = await Request.find().countDocuments();
  let count_notification;
  var page = req.params.page || 1;
  const filter = req.params.filter;
  const value = req.params.value;
  if(req.user.isAdmin){
    count_notification = await Request.find({"user_id.id": req.user._id}).countDocuments();
  }else{
    count_notification = await Notification.find({"user_id.id": req.user._id}).countDocuments();
  }

  let searchObj = {};

  if(filter != 'all' && value != 'all') {
    searchObj[filter] = value;
  }

  try{
    const books= await Book
    .find(searchObj)
    .skip((PER_PAGE * page)-PER_PAGE)
    .limit(PER_PAGE)


    const count = await Book.find(searchObj).countDocuments();

    res.render("books", {
      books:books,
      curent: page,
      pages: Math.ceil(count/PER_PAGE),
      filter: filter,
      value: value,
      user: req.user,
      count_requests:count_requests,
      count_notification:count_notification,
    })
  } catch(err) {
    console.log(err);
      res.redirect("back");
  }
},
exports.findBooks = async(req, res, next) => {
  const count_requests = await Request.find().countDocuments();
  const count_notification = await Notification.find({"user_id.id": req.user.id}).countDocuments();
  var page = req.params.page ||1;
  const filter = req.body.filter.toLowerCase() ;
  const value = req.body.searchName;

  if(value == "" || filter=="select filter..."){
    req.flash("error", "Search field or Select field is empty. Please fill the search field to get books");
    res.redirect("back");
  }
  const searchObj = {};
  searchObj[filter] = value;
  try{
    const books = await Book
    .find(searchObj)
    .skip((PER_PAGE * page) - PER_PAGE)
    .limit(PER_PAGE)

    const count = await Book.find(searchObj).countDocuments();

    res.render("books", {
      books : books,
      current: page,
      pages: Math.ceil(count/PER_PAGE),
      filter:filter,
      value: value,
      user: req.user,
      count_requests:count_requests,
      count_notification:count_notification,
    })
  } catch(err) {
    console.log(err);
      res.redirect("back");
  }
};
 exports.getBookDetails = async(req, res, next) => {
   const count_requests = await Request.find().countDocuments();
   const count_notification = await Notification.find({"user_id.id": req.user.id}).countDocuments();
   try{
     const book_id = req.params.book_id;
     const book = await Book.findById(book_id).populate("comments");
     res.render("user/BookDetails", {book: book, count_requests:count_requests, count_notification:count_notification,});
   }catch(err) {
     console.log(err);
      res.redirect("back");;
   }
 };
