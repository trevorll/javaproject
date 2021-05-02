const fs = require("fs");
const Mpesa = require('mpesa-node')


const Book = require("../models/book");
const User = require("../models/user");
const Request = require("../models/request");
const Issue = require("../models/issue");
const Activity = require("../models/activity");
const Notification = require("../models/notifications");
const Paidfines = require("../models/paidfines");


const deleteImage = require("../utils/delete_image");
const user = require("../models/user");
const paidfines = require("../models/paidfines");

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

exports.getTotalFines = async(req, res, next) => {
      const issues = await Paidfines.find();
      let total_fines=0;
      let balance = 0;
      for(let issue of issues) { 
        total_fines += issue.book_info.amount;
        balance += issue.book_info.balance;
            console.log(total_fines);
            }
            
          

        
      
        let remaining = total_fines+balance;
        res.render("admin/fines", {
          total_fines: total_fines,
          balance: balance,
          remaining:remaining,
        })
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
    req.flash("success", `You have added ${new_book.title} to the inventory`);
    res.redirect("/admin/bookInventory/all/all/1");
  } catch(err) {
    console.log(err)
    res.redirect('back');
  }
};
exports.getUpdateBook = async (req, res, next) => {

  try {
      const count_requests = await Request.find().countDocuments();
      const book_id = req.params.book_id;
      const book = await Book.findById(book_id);

      res.render('admin/book', {
          book: book,
          count_requests:count_requests,
      })
  } catch(err) {
      console.log(err);
      return res.redirect('back');
  }
};
exports.postUpdateBook = async(req, res, next) => {

  try {
      const description = req.sanitize(req.body.book.description);
      const book_info = req.body.book;
      const book_id = req.params.book_id;

      await Book.findByIdAndUpdate(book_id, book_info);

      res.redirect("/admin/bookInventory/all/all/1");
  } catch (err) {
      console.log(err);
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
    res.redirect("back");

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
exports.getChart = async(req, res, next) => {
  const theme = req.params.theme;
  const type = req.params.type || "line";
  const heading = req.params.heading;
  var labels = [];
  var number = [];
  var track = [];
  const users= await User.find();
  const count_users = await User.find().countDocuments();
  const count_requests = await Request.find().countDocuments();
  for(let user of users){
    const month = user.joined.getMonth()+1;
    const year = user.joined.getFullYear();
    const date = user.joined.getDate();
    const fullDate = `${date}/${month}/${year}`;
    var n = labels.includes(fullDate);
    track.push(fullDate);
    if(n){
      continue;
    }
    labels.push(fullDate);
  };


var count=0;
for(var i = 0; i < labels.length; i++){
  count=0;
  for(var j=0; j<track.length; j++){
    if(labels[i] == track[j]){
        count++;

  }
}
number.push(count)
};

  res.render("user/chart",{
    users:users,
    count_users:count_users,
    theme:theme,
    labels:labels,
    heading:heading,
    type: type,
    number:number,
    count_requests:count_requests
  });
};

exports.getActivitiesChart = async(req, res, next) => {
  const theme = req.params.theme;
  const type = req.params.type || "line";
  const heading = req.params.heading;
  var labels = [];
  var number = [];
  var track = [];
  const activities= await Activity.find();
  const count_users = await User.find().countDocuments();
  const count_requests = await Request.find().countDocuments();
  for(let activity of activities){
    const month = activity.entryTime.getMonth()+1;
    const year = activity.entryTime.getFullYear();
    const date = activity.entryTime.getDate();
    const fullDate = `${date}/${month}/${year}`;
    var n = labels.includes(fullDate);
    track.push(fullDate);
    if(n){
      continue;
    }
    labels.push(fullDate);
  };


var count=0;
for(var i = 0; i < labels.length; i++){
  count=0;
  for(var j=0; j<track.length; j++){
    if(labels[i] == track[j]){
        count++;

  }
}
number.push(count)
};

  res.render("user/chart",{
    users:activities,
    count_users:count_users,
    theme:theme,
    labels:labels,
    heading:heading,
    type: type,
    number:number,
    count_requests:count_requests
  });
}
exports.deleteUser = async(req, res, next) => {
  const user_id = req.params.user_id;
  const user = await User.findById(user_id);
  if(user.bookIssueInfo.length > 0) {
    req.flash("error","this user has books in possession therefore cant be deleted");
    return res.redirect('back');
  }
  try {
  await user.remove();

  let imagePath = `images/${user.image}`;
  if(fs.existsSync(imagePath)) {
      deleteImage(imagePath);
  }

  await Issue.deleteMany({"user_id.id": user_id});
  await Comment.deleteMany({"author.id":user_id});
  await Activity.deleteMany({"user_id.id": user_id});
  await Notification.deleteMany({"user_id.id": user_id});
  req.flash("success", "User Successfully deleted");


  res.redirect("back");
} catch (err) {
  console.log(err);
  res.redirect('back');
}
}
exports.putFineUser = async(req, res, next) => {
  const amount =req.body.amount;
  const currentUser = await User.findById(req.user._id);
  const user = await User.findOne({"username": req.body.username});
  const issues = await Issue.find({"user_id.id": user.id});
  for(let issue of issues){
  try {
    
    const book = await Book.findById(issue.book_info.id);
    if(!user){
      flash("error", "user doesnt exist");
      res.redirect("back");
    }else if(amount <= 0){
      req.flash("error", "payment invalid");
      res.redirect("back")
    }else if(user.fines==0){
      req.flash("error", "fine the user has no fines to pay!");
      res.redirect("back");
    }else if(user.fines == amount){
      user.fines =0;
      try {

        book.stock += 1;
        const paid = new paidfines({
          book_info: {
            id: book._id,
            title: book.title,
            author: book.author,
            ISBN: book.ISBN,
            issuedDate: issue.book_info.issueDate,
            returnDate: issue.book_info.returnDate,
            amount: amount,
    
          },
          user_id: {
            id: user._id,
            username: user.username
          },
          fined_by: {
            id: currentUser._id,
            username: currentUser.username,
          },
    
        });
        user.violationFlag = false;
        const pos = user.bookIssueInfo.indexOf(book._id);

        user.bookIssueInfo.splice(pos, 1);
        await paid.save();
        await user.save();
        await book.save();
        await Issue.findByIdAndRemove(issue.id);
        req.flash("success", "fine payed successfully");    
        res.redirect('back');
    
    
      } catch (err) {
        console.log(err)
      }    
    }else if(user.fines > amount){
      req.flash("warning", "please pay all the amount for you to be unflagged and allowed to return the book");
      res.redirect("back");
    }else if(user.fines < amount) {
      const balance = user.fines-amount;
      user.fines = 0;
      try {

        book.stock += 1;
        const paid = new paidfines({
          book_info: {
            id: book._id,
            title: book.title,
            author: book.author,
            ISBN: book.ISBN,
            issuedDate: issue.book_info.issueDate,
            returnDate: issue.book_info.returnDate,
            amount: amount,
            balance:balance,
    
          },
          user_id: {
            id: user._id,
            username: user.username
          },
          fined_by: {
            id: currentUser._id,
            username: currentUser.username,
          },
    
        });
        const pos = user.bookIssueInfo.indexOf(book._id);
        user.bookIssueInfo.splice(pos, 1);
        user.violationFlag = false;
        await paid.save();
        await user.save();
        await book.save();
        await Issue.findByIdAndRemove(issue.id);
        req.flash("success", "fine payed successfully! collect balance at the end of the semester");    
        res.redirect('back');
    
    
      } catch (err) {
        console.log(err)
      }
    }

    }catch (err) {
    console.log(err);
  }
}
}
exports.postNewComment = async(req, res, next) => {
  try{
      const comment_text = req.body.comment;
      const user_id = req.user._id;
      const username = req.user.username;
      const book_id = req.params.book_id;
      const book = await Book.findById(book_id);

      const comment = new Comment({
        text: comment_text,
        author: {
          id: user_id,
          username: username,
        },
        book: {
          id: book._id,
          title: book.title,
        }
      });
      await comment.save();
      book.comments.push(comment._id);
      await book.save();

      const activity = new Activity({
        category:"Comment",
        user_id: {
          id: req.user.id,
          username: req.body.username,
        }

      });
      await activity.save();
      res.redirect("/books/details/"+book_id);
    }catch(err) {
      console.log(err);
      return res.redirect("back");
    }
  };
  exports.postUpdateComment = async(req, res, next) => {
    try{
        const newComment_text = req.body.comment;
        const user_id = req.user._id;
        const username = req.user.username;
  
        const book_id = req.params.book_id;
        const book = await Book.findById(book_id);
        await Comment.findByIdAndUpdate(req.params.comment_id, newComment_text);
  
        const activity = new Activity({
          category:"Update Comment",
          user_id: {
            id: req.user.id,
            username: req.body.username,
          }
  
        });
        await activity.save();
        res.redirect("/books/details/"+book_id);
      }catch(err) {
        console.log(err);
        return res.redirect("back");
      }
    };
    exports.deleteComment = async(req, res, next) => {
      try{
          const comment_id = req.body.comment_id;
          const user_id = req.user._id;
          const username = req.user.username;
    
          const book_id = req.params.book_id;
          const book = await Book.findById(book_id);

          const pos = book.comments.indexOf(comment_id);
          book.comments.splice(pos, 1);
          await book.save();

        // removing comment from Comment
          await Comment.findByIdAndRemove(comment_id);
    
          
    
          const activity = new Activity({
            category:"Delete Comment",
            user_id: {
              id: req.user.id,
              username: req.body.username,
            }
    
          });
          await activity.save();
          res.redirect("/books/details/"+book_id);
        }catch(err) {
          console.log(err);
          return res.redirect("back");
        }
      };
// admin -> show all activities of one user
exports.getUserAllActivities = async (req, res, next) => {
  const count_requests = await Request.find().countDocuments();
  try {
    const user_id = req.params.user_id;
    const activities = await Activity.find({"user_id.id": user_id})
    const user = await User.findById(user_id)
    .sort('-entryTime');
      res.render("admin/activities", {
        activities: activities,
        count_requests:count_requests,
        username: user.username
      });
  } catch(err) {
      console.log(err);
      res.redirect('back');
  }
};
exports.postShowActivitiesByCategory = async (req, res, next) => {
  const count_requests = await Request.find().countDocuments();
  try {
      const category = req.body.category;
      const user_id = req.params.user_id;
      const activities = await Activity.find({"category": category});
      const user = await User.findById(user_id)

      res.render("admin/activities", {
          activities: activities,
          count_requests:count_requests,
          username: user.username
      });
  } catch(err) {
      console.log(err);
      res.redirect('back');
  }
};



 

