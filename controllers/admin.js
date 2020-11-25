const fs = require("fs");


const Book = require("../models/book");
const User = require("../models/user");
const Request = require("../models/request");
const Issue = require("../models/issue");
const Activity = require("../models/activity");
const Notification = require("../models/notifications");


const deleteImage = require("../utils/delete_image");

const PER_PAGE = 10;

exports.getDashboard = async(req, res, next) => {
  var page = req.query.page || 1;
  try{
    const users_count = await User.find().countDocuments();
    const books_count = await Book.find().countDocuments();
    const activity_count= await Activity.find().countDocuments();
    const activities = await Activity
          .find()
          .sort("-entryTime")
          .skip((PER_PAGE * page) - PER_PAGE)
          .limit(PER_PAGE)

    const count_requests = await Request.find().countDocuments();


    res.render("admin/index", {
      users_count: users_count,
      books_count: books_count,
      activities: activities,
      count_requests: count_requests,
      current: page,
      pages: Math.ceil(users_count / PER_PAGE)
    });
  } catch(err) {
    console.log(err)
  }
};

exports.postDashboard = async(req, res, next) => {
  var page = req.params.page || 1;
  try{
    const search_value = req.body.searchUser;
    const users_count = await User.find().countDocuments();
    const books_count = await Book.find().countDocuments();
    const activity_count= await Activity.find().countDocuments();
    const activities = await Activity
          .find({
            $or: [
                {"user_id.username" :search_value},
                {"category" : search_value}
              ]
          });


    const count_requests = await Request.find().countDocuments();


    res.render("admin/index", {
      users_count: users_count,
      books_count: books_count,
      activities: activities,
      count_requests: count_requests,
      current: page,
      pages: 0
    });
  } catch(err) {
    console.log(err)
  }
};

exports.getAddNewBook = async(req, res, next) => {
  const count_requests = await Request.find().countDocuments();
  res.render("admin/addbook",{count_requests:count_requests})
};
exports.getUsers = async(req, res, next) => {
  try {
    var page = req.params.page || 1;
    const count_requests = await Request.find().countDocuments();
    const users = await User
          .find()
          .sort('-entryTime')
          .skip((PER_PAGE * page) - PER_PAGE)
          .limit(PER_PAGE)
    const users_count = await User.find().countDocuments();
          res.render("admin/users",{
            users:users,
            current: page,
            pages: Math.ceil( users_count / PER_PAGE),
            count_requests: count_requests,
          })
  }catch(err){
    console.log(err);
  }
}

exports.getUserProfile = async(req, res, next) => {
  try {
    var page = req.params.page || 1;
    const count_requests = await Request.find().countDocuments();
    const user = await User.findById(req.params.user_id);
    const users_count = await User.find().countDocuments();
    const comment = await Comment.find({"author.id":req.params.user_id}).sort("-date");
    const activities= await Activity
        .find({"user_id.id":req.params.user_id})
        .sort("-entryTime")
    const issues = await Issue.find({"user_id.id":req.params.user_id});
    const activity_count = await Activity.find({"user_id.id":req.params.user_id}).countDocuments();
          res.render("admin/user",{
            user:user,
            activities: activities,
            current: page,
            issues: issues,
            comment:comment,
            pages: Math.ceil( activity_count / PER_PAGE),
            count_requests: count_requests,
          })
  }catch(err){
    console.log(err);
  }
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
};
exports.getAdminRequests = async(req, res, next) => {
  var page = req.query.page || 1;
  const requests = await Request
      .find()
      .sort('-entryTime')
      .skip((PER_PAGE * page) - PER_PAGE)
      .limit(PER_PAGE);
  const count_requests = await Request.find().countDocuments();
  res.render("admin/request",{
    requests:requests,
    count_requests: count_requests,
    pages: Math.ceil((requests / PER_PAGE)-PER_PAGE),
  });
}

exports.getuserinfo = async(req, res, next) =>{
  const user_id = req.params.user_id;
  const count_requests = await Request.find().countDocuments();
  const user = await User.findById(user_id);
  res.render("admin/userinfo", {
    user:user,
    count_requests: count_requests,

  })
};
exports.postIssueBook = async(req, res, next) => {
  currentUser = await User.findById(req.user.id);
  const request_id = req.params.request_id;
  const request = await Request.findById(request_id);
  const user = await User.findById(request.user_id.id);

  try {
    const book = await Book.findById(request.book_info.id);

    book.stock -= 1;
    const issue = new Issue({
      book_info: {
        id: book._id,
        title: book.title,
        author: book.author,
        ISBN: book.ISBN,
        category: book.category,
        stock: book.stock,
      },
      user_id: {
        id: user._id,
        username: user.username
      },
      issued_by: {
        id: currentUser._id,
        username: currentUser.username,
      },

    });
    user.bookIssueInfo.push(book._id);
    const notification = new Notification({
      info: {
        id: book._id,
        title: book.title,
      },
      category: "Issue",
      time: {
        id: issue._id,
        issueDate: issue.book_info.issueDate,
        returnDate: issue.book_info.returnDate,
      },
      user_id: {
        id: user._id,
        username: user.username,
      },
      issued_by: {
        id: req.user._id,
        username: req.user.username
      }

    });
    const activity = new Activity({
            info: {
                id: book._id,
                title: book.title,
            },
            category: "Issue",
            time: {
                id: issue._id,
                issueDate: issue.book_info.issueDate,
                returnDate: issue.book_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });
    await issue.save();
    await user.save();
    await book.save();
    await notification.save();
    await activity.save();
    await Request.findByIdAndRemove(request_id);

    res.redirect('back');


  } catch (err) {
    console.log(err)
  }
};

exports.getAdminBookInventory = async(req, res, next) => {
  try {
    let page = req.params.page || 1;

    const count_requests = await Request.find().countDocuments();
    const books_count = await Book.find().countDocuments();
    const books = await Book.find().skip((PER_PAGE * page) - PER_PAGE).limit(PER_PAGE)


    res.render("admin/bookInventory",{
      current:page,
      books:books,
      count_requests: count_requests,
      pages: Math.ceil(books_count/PER_PAGE),

    })

  } catch (err) {
    console.log(err);
  }
};
exports.postAdminBookInventory = async(req, res, next) => {
    try {
        let page = req.params.page || 1;
        const filter = req.body.filter.toLowerCase();
        const value = req.body.searchName;

        if(value == "" || filter =="select filter...") {
            req.flash("error", "Search field is empty. Please fill the search field in order to get a result");
            return res.redirect('back');
        }
        const searchObj = {};
        searchObj[filter] = value;

        // get the books count
        const books_count = await Book.find(searchObj).countDocuments();
        const count_requests = await Request.find().countDocuments();

        // fetch the books by search query
        const books = await Book
            .find(searchObj)
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        // rendering admin/bookInventory
        res.render("admin/bookInventory", {
            books: books,
            current: page,
            count_requests:count_requests,
            pages: Math.ceil(books_count / PER_PAGE),
            filter: filter,
            value: value,
        });

    } catch(err) {
         console.log(err);
        return res.redirect('back');
    }
};
exports.postSearchUser = async(req, res, next) => {
  try {
  const page = req.params.page || 1;
  const search_value = req.body.searchUser;
  const count_requests = await Request.find().countDocuments();

  const users = await User.find({
      $or: [
          {"firstName": search_value},
          {"lastName": search_value},
          {"username": search_value},
          {"email": search_value},
      ]
  });

  if(users.length <= 0) {
      req.flash("error", "User not found!");
      return res.redirect('back');
  } else {
      res.render("admin/users", {
          users: users,
          current: page,
          count_requests: count_requests,
          pages: 0,
      });
  }
} catch (err) {
  console.log(err);
  res.redirect('back');
}
}
exports.getFlagUser = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;

        const user = await User.findById(user_id);

        if(user.violationFlag) {
            user.violationFlag = false;
            await user.save();
            const notification = new Notification({
              category: "Unflagged",
              user_id: {
                id: user._id,
                username: user.username,
              }

            });
            await notification.save();
            req.flash("success", `You have just unflagged  ${user.firstName} ${user.lastName} !`);
        } else {
            user.violationFlag = true;
            await user.save();
            const notification = new Notification({
              category: "Flaggged",
              user_id: {
                id: user._id,
                username: user.username,
              }

            });
            await notification.save();
            req.flash("warning", `You have just flagged the user ${user.firstName} ${user.lastName} !`);
        }

        res.redirect("/admin/users/1");
    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};
exports.postReturnBook = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const book_id = req.params.book_id;
        const request_id = req.params.request_id;

        const user = await User.findById(user_id);
        const book = await Book.findById(book_id);
        const pos = user.bookIssueInfo.indexOf(req.params.book_id);

        book.stock +=1;
        await book.save();


        const issue = await Issue.findOne({"user_id.id": user_id, "book_info.id":book._id});
        await issue.remove();

        user.bookIssueInfo.splice(pos, 1);
        await user.save();


         const activity = new Activity({
              info: {
                  id: issue.book_info.id,
                  title: issue.book_info.title,
              },
              category: "Return",
              time: {
                  id: issue._id,
                  issueDate: issue.book_info.issueDate,
                  returnDate: issue.book_info.returnDate,
              },
              user_id: {
                  id: user._id,
                  username: user.username,
              }
          });
          await activity.save()

          const notification = new Notification({
            info: {
              id: book._id,
              title: book.title,
            },
            category: "Grant Return",
            time: {
              id: issue._id,
              issueDate: issue.book_info.issueDate,
              returnDate: issue.book_info.returnDate,
            },
            user_id: {
              id: user._id,
              username: user.username,
            }

          });
          await notification.save();
          await Request.findByIdAndRemove(request_id);
          res.redirect("back")

    } catch (err) {
        console.log(err);
        res.redirect('back');
    }
};



exports.getRenewBook = async(req, res, next) => {
    try {

      const book_id = req.params.book_id;
      const user_id = req.params.user_id;
      const request_id = req.params.request_id;

      const user = await User.findById(user_id);
      const book = await Book.findById(book_id);
      const searchObj = {
            "user_id.id": user_id,
            "book_info.id": book_id,
        };



      const issue = await Issue.findOne(searchObj);
      let time = issue.book_info.returnDate.getTime();
        issue.book_info.returnDate = time + 7*24*60*60*1000;
        issue.book_info.isRenewed = true;


        const notification = new Notification({
          info: {
            id: book._id,
            title: book.title,
          },
          category: "Grant Renew",
          time: {
            id: issue._id,
            issueDate: issue.book_info.issueDate,
            returnDate: issue.book_info.returnDate,
          },
          user_id: {
            id: user._id,
            username: user.username,
          }

        });

        // logging the activity
        const activity = new Activity({
            info: {
                id: issue._id,
                title: issue.book_info.title,
            },
            category: "Renew",
            time: {
                id: issue._id,
                issueDate: issue.book_info.issueDate,
                returnDate: issue.book_info.returnDate,
            },
            user_id: {
                id: user._id,
                username: user.username,
            }
        });


        await issue.save();
        await activity.save();
        await notification.save();
        await Request.findByIdAndRemove(request_id);

        res.redirect("back");
    } catch (err) {
        console.log(err);
        return res.redirect("back");

    }
};

exports.deleteDeclineRequest = async(req, res, next) => {
  const request_id = req.params.request_id;
  const book_id = req.params.book_id;
  const user_id = req.params.user_id;
  try {
    const book = await Book.findById(book_id);
    const user = await User.findById(user_id);
    const request = await Request.findById(request_id);


    const notification = new Notification({
      info: {
        id: book._id,
        title: book.title,
      },
      category: "Decline Request",
      user_id: {
        id: user._id,
        username: user.username,
      }

    });
    await notification.save();

    await Request.findByIdAndRemove(request_id);

    }catch(err){
      console.log(err);
    }
  };
  exports.deleteUserAccount = async(req, res, next) => {
    const user_id = req.params.user_id;
    const request_id = req.params.request_id;
    try {
    const user = await User.findById(user_id);
    await user.remove();

    let imagePath = `images/${user.image}`;
    if(fs.existsSync(imagePath)) {
        deleteImage(imagePath);
    }

    await Issue.deleteMany({"user_id.id": user_id});
    await Comment.deleteMany({"author.id":user_id});
    await Activity.deleteMany({"user_id.id": user_id});
    await Notification.deleteMany({"user_id.id": user_id});
    await Request.findByIdAndRemove(request_id);
    req.flash("success", "User Successfully deleted");


    res.redirect("back");
} catch (err) {
    console.log(err);
    res.redirect('back');
}
};
