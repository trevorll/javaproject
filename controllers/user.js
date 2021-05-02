// importing dependencies
const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');

// importing models
const User = require("../models/user"),
      Activity = require("../models/activity"),
      Book = require("../models/book"),
      Issue = require("../models/issue"),
      Comment = require("../models/comment"),
      Notification = require("../models/notifications"),
      Request = require("../models/request");

// importing utilities
const deleteImage = require('../utils/delete_image');
const { postIssueBook } = require('./admin');
const user = require('../models/user');

// GLOBAL_VARIABLES
const PER_PAGE = 5;

//user -> dashboard
exports.getUserDashboard = async(req, res, next) => {
    var page = req.params.page || 1;
    const user_id = req.user._id;

    try {
        // fetch user info from db and populate it with related book issue
        const user = await User.findById(user_id);

        if(user.bookIssueInfo.length > 0) {
            const issues = await Issue.find({"user_id.id" : user._id});

            for(let issue of issues) {
                if(issue.book_info.returnDate < Date.now() && issue.book_info.isPaid==false) {
                    const penalty = Math.floor((((Date.now()-issue.book_info.returnDate)/(1*24*60*60*1000))*5));
                    if(user.fine < 0){
                      user.fines+=penalty;
                      await user.save();
                      if(user.fines==0){
                        user.violationFlag=false;
                        await user.save();
                      }else if(user.fines>0){
                        user.violationFlag=true;
                        await user.save();
                      }
                    }else{
                    user.fines = penalty;
                    user.violationFlag = true;
                    await user.save();
                    req.flash("warning", "You are flagged for not returning " + issue.book_info.title + " on time");
                    break;
                    }
                }
            }
        };

        const activities = await Activity
            .find({"user_id.id": req.user._id})
            .sort('-entryTime')
            .skip((PER_PAGE * page) - PER_PAGE)
            .limit(PER_PAGE);

        const activity_count = await Activity
            .find({"user_id.id": req.user._id})
            .countDocuments();

        const notification = await Notification
            .find({"user_id.id": req.user._id})
            .countDocuments();



        res.render("user/index",{
          user : user,
          current: page,
          count_notification: notification,
          pages: Math.ceil(activity_count / PER_PAGE),
          activities: activities,
        });

    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
}

// user -> profile
exports.getUserProfile = async(req, res, next) => {
  const notification = await Notification
      .find({"user_id.id": req.user._id})
      .countDocuments();
    res.render("user/profile", {
      count_notification: notification,
    });
}

exports.putUpdatePassword = async(req, res, next) => {
  const username = req.user.username;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmPassword;
   if(confirmPassword != newPassword){
     req.flash("error", "passwords dont match!");
     res.redirect("back");
   }else{

  try{
    const user = await User.findByUsername(username);
    await user.changePassword(oldPassword, newPassword);
    await user.save()


    const activity = new Activity({
      category: "Update Password",
      user_id : {
        id: req.user._id,
        username: req.user.username,
      }
    });
    await activity.save();

    const notification = new Notification({
      category: "Update Password",
      user_id: {
        id: req.user.id,
        username: req.user.username,
      }
    })
    await notification.save();
    req.flash("success", "Your password is recently updated. please log in again to confirm");
    res.redirect("/auth/user-login");

  }catch(err) {
    console.log(err);
    return res.redirect("back")
  }
}
}
//update profile
 exports.putUpdateUserProfile = async(req, res, next) => {
   try{
     const userUpdateInfo = {
       "firstName": req.body.firstName,
       "lastName":  req.body.lastName,
       "email" :    req.body.email,
     }
     await User.findByIdAndUpdate(req.user._id,userUpdateInfo);

     const activity = new Activity({
       category: "Update Profile Info",
       user_id: {
         id: req.user.id,
         username: req.user.username,
       }
     })
     await activity.save();

     const notification = new Notification({
       category: "Update Profile Info",
       user_id: {
         id: req.user.id,
         username: req.user.username,
       }
     })
     await notification.save();

     res.redirect('back');



 }catch(err) {
   console.log(err);
   return res.redirect('back')
 }
}

exports.postUploadUserImage = async(req, res, next) => {
  try {
    const user_id = req.user._id;
    const user = await User.findById(user_id);

    let imgeurl;
    if(req.file) {
      imageUrl = `${uid()}__${req.file.originalname}`;
      let filename =`images/${imageUrl}`;
      let previousImagePath = `images/${user.image}`;


      const imageExist = fs.existsSync(previousImagePath);


      if(imageExist) {
        deleteImage(previousImagePath);
      }
      await sharp(req.file.path)
          .rotate()
          .resize(500, 500)
          .toFile(filename);
      fs.unlink(req.file.path, err => {
        if(err) {
          console.log(err);
        }
      })
    }else {
      imageUrl = '';
    }
    user.image = imageUrl;
    await user.save();

    const activity = new Activity({
      category: "Uploaded New Profile Photo",
      user_id: {
        id: req.user.id,
        username: req.user.username,
      }
    });
    await activity.save();
    res.redirect("/user/1/profile");
  }catch(err) {
    console.log(err);
    res.redirect('back');
  }
};
exports.postNewComment = async(req, res, next) => {
  try{
      const comment_text = req.body.comment;
      const user_id = req.user._id;
      const username = req.user.username;
      console.log(username);

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

  exports.getNotification = async(req, res, next) =>{
    const user_id = req.user._id;
    var page = req.params.page || 1;
    try{
      const user = await User.findById(user_id);
      const notifications = await Notification
          .find({"user_id.id": req.user._id})
          .sort('-entryTime')
          .skip((PER_PAGE * page) - PER_PAGE)
          .limit(PER_PAGE);

      const count_notification = await Notification
          .find({"user_id.id": req.user._id})
          .countDocuments();

      res.render("user/notification",{
        count_notification: count_notification,
        notifications: notifications,
        pages: Math.ceil((count_notification / PER_PAGE)),
        current: page,

      });
    }catch(err){
      console.log(err);
    }

  };
  exports.deleteNotification = async(req, res, next) => {
    const user_id = req.user._id;
    var page = req.params.page || 1;
    const notification_id = req.params.notification_id;
    const username =req.user.username;
    try{
      const notification = await Notification.findById(notification_id);
      await Notification.findByIdAndRemove(notification_id);
      res.redirect('back')
    }catch(err) {
      console.log(err);
    }

  }
  exports.postBorrowBook = async(req, res, next) => {
    if(req.user.bookIssueInfo.length>=5){
      req.flash("warning", "you can't borrow more than 5 books at once");
      return res.redirect("back");

    }
    
    else if(req.user.violationFlag){
      req.flash("warning","you cant borrow a book you have been flagged!");
      req.flash("error", "please contact the admin");
      return res.redirect("back");
    }

    try{
      const book = await Book.findById(req.params.book_id);
      const user = await User.findById(req.params.user_id);
      const searchObj = {
        "book_info.id": book._id,
        "user_id.id": user._id
      };

      const check = await Request.findOne(searchObj);
      if(check){
        req.flash("error", "Borrow request already sent!");
        return res.redirect("back");
      };

      const requests = new Request({
        book_info: {
          id: book.id,
          title: book.title,
          autho: book.author,
          ISBN: book.ISBN,
          category: book.category,
          stock: book.stock,
        },
        user_id: {
          id: user._id,
          username: user.username,
        },
        reason: "Borrow Request",
      });
      const notification = new Notification({
        info:{
          id: book._id,
          title: book.title,
        },
        category: "Send Borrow Request",
        user_id:{
          id:user._id,
          username: user.username
        }
      });
      await notification.save();
      await requests.save();
      req.flash("success", "Request Sent");
      res.redirect("/books/all/all/1");


    }catch(err) {
      console.log(err)
      return res.redirect('back');
    }
  };
  exports.getReturnRenew = async(req, res, next) => {
    const user_id = req.user.id;
    const count_notification = await Notification.find({"user_id.id": req.user.id}).countDocuments();
    try {
      const issue = await Issue.find({"user_id.id":user_id});
      const activity_count = await Activity
        .find({"user_id.id": req.user._id})
        .countDocuments();
        res.render("user/return-renew",{
          count_notification:count_notification,
          user: issue,
          user_id: user_id,
          activity_count: activity_count,
        })
    } catch (err) {
      console.log(err);

    }

  }

  exports.postRenewBook = async(req, res, next) => {
    const searchReq = {
      "book_info.id": req.params.user_id,
      "user_id.id": req.params.book_id
    };

    const check = await Request.findOne(searchReq);
    if(check){
      req.flash("warning", "Renew request already sent!");
      console.log("error");
      return res.redirect("back");
    };
    const searchObj={
      "user_id.id": req.params.user_id,
      "book_info.id": req.params.book_id,

    };
    try{

        const book  = await Book.findById(req.params.book_id);
        const user = await User.findById(req.params.user_id);

        const request = new Request({
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
            username: user.username,
          },
          reason: "Renew book",

        });
        const notification = new Notification({
          info:{
            id: book._id,
            title: book.title,
          },
          category: "Send Renew Request",
          user_id:{
            id:user._id,
            username: user.username
          }
        });
        await request.save();
        await notification.save();
        req,flash("success", "Request Sent");
        res.redirect('back');
    }catch(err) {
      console.log(err);
    }

  };
  exports.postReturnBook = async(req, res, next) =>{
    const searchObj = {
      "book_info.id": req.params.book_id,
      "user_id.id": req.params.user_id,
    };

    const check = await Request.findOne(searchObj);
    if(req.user.violationFlag){
      req.flash("warning", "you are flagged! Please visit the library to return the book");
      res.redirect("back")
    }else if(check){
      req.flash("error", "Return request already sent!");
      return res.redirect("back");
    };

    try {
      const book_id = req.params.book_id;
      const book  = await Book.findById(req.params.book_id);
      const user = await User.findById(req.params.user_id);
      const request = new Request({
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
          username: user.username,
        },
        reason: "Return book",

      });
      const notification = new Notification({
        info:{
          id: book._id,
          title: book.title,
        },
        category: "Send Return Request",
        user_id:{
          id:user._id,
          username: user.username
        }
      });
      await request.save();
      await notification.save();
      req.flash("success", "Request sent");
      res.redirect('back')
    } catch (err) {
      console.log(err);
    }
  };
  exports.deleteMyAccount = async(req, res, next) => {
    const check = await Request.findOne({"user_id.id": req.user._id});
    if(check){
      req.flash("error", "Delete Request Already sent");
      return res.redirect("back");
    }

    try {
      const request = new Request({
        user_id: {
          id: req.user._id,
          username: req.user.username,
        },
        reason: "Delete User Account",

      });

      const notification = new Notification({
        category: "Delete My Account",
        user_id:{
          id: req.user._id,
          username: req.user.username
        }
      });
      await request.save();
      await notification.save();
      req.flash("success", "Request Sent Successfylly")
      res.redirect('back')
    } catch (err) {
      console.log(err);
    }
  };
  exports.getChart = async(req, res, next) => {
    const heading = req.params.heading;
    var labels = [];
    var number = [];
    var track = [];
    const users= await User.find();
    const count_users = await User.find().countDocuments();
    const activities = await Activity.find({"user_id.id": req.user._id});
    const count_notification = await Notification.find({"user_id.id": req.user._id}).countDocuments();

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
      users:users,
      count_users:count_users,
      count_notification:count_notification,
      heading: heading,
      labels:labels,
      number:number,

    });
  }
  