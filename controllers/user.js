// importing dependencies
const sharp = require('sharp');
const uid = require('uid');
const fs = require('fs');

// importing models
const User = require("../models/user"),
      Activity = require("../models/activity"),
      Book = require("../models/book"),
      Issue = require("../models/issue"),
      Comment = require("../models/comment");
      Notification = require("../models/notifications")

// importing utilities
const deleteImage = require('../utils/delete_image');

// GLOBAL_VARIABLES
const PER_PAGE = 5;

//user -> dashboard
exports.getUserDashboard = async(req, res, next) => {
    var page = req.params.page || 1;
    const user_id = req.user._id;

    try {
        // fetch user info from db and populate it with related book issue
        const user = await User.findById(user_id);

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
          activity_count: notification,
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
      activity_count: notification,
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
        activity_count: count_notification,
        notifications: notifications,
        pages: Math.ceil(count_notification / PER_PAGE),
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
