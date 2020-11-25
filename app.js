const express = require("express");
      app = express();
      bodyParser = require("body-parser");
      mongoose = require("mongoose");
      passport = require("passport");
      multer = require('multer');
      uid = require('uid');
      path = require("path");
      sanitizer = require("express-sanitizer");
      methodOverride = require("method-override");
      localStrategy = require("passport-local");
      fs = require("fs");
      flash = require("connect-flash");

      User = require("./models/user");
      Admin = require("./models/admin");
      Issue = require("./models/issue");
      Request = require("./models/request");
      userRoutes = require("./routes/users");
      authRoutes = require("./routes/auth");
      bookRoutes = require("./routes/books");
      adminRoutes = require("./routes/admin");
      middleware = require("./middleware");


//seed(1000);

//app config
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(sanitizer());

//db config
const url = process.env.db_url || "mongodb://localhost/db1";
mongoose.connect(url, {useNewUrlParser : true, useCreateIndex: true, useUnifiedTopology: true,});

mongoose.set('useFindAndModify', false);

//passport config
app.use(require("express-session")({
  secret : "goddy godd gody",
  saveUninitialized : false,
  resave : false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//config image file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${uid()}-${file.originalname}`);
  }
});
const filefilter = (req, file, cb) => {
  if(
      file.mimetype === 'images/png' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'img.jpeg'
    ) { cb(null, true);
    } else {
      cb(null, false);
    }

};
app.use(multer({storage: fileStorage, filefilter: filefilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.locals.currentUser =req.user;
  res.locals.error       =req.flash("error");
  res.locals.success     =req.flash("success");
  res.locals.warning     =req.flash("warning");
  next();
});

//routes
app.use(userRoutes);
app.use(authRoutes);
app.use(bookRoutes);
app.use(adminRoutes);

function deleteImage(imagePath, next) {
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.log("Failed to delete image at delete profile");
      return next(err);
    }
  });
}
app.listen(8000, ()=> {
  console.log(`application running at: http://localhost:8000`);
});
