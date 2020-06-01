const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt");

// GET users listening
router.get("/signup", function (req, res, next) {
  res.render("signup.ejs");
});

router.get("/login", function (req, res, next) {
  res.render("login.ejs");
});

router.get("/dashboard", function (req, res, next) {
  res.render("dashboard.ejs", {
    title: "Blog Repository",
    user: req.session.user || null,
    email: req.session.user || null,
  });
});

router.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    db.Users.create({
      username,
      email,
      password: hash,
    }).then((user) => {
      delete user.password;
      req.session.user = user;
      res.redirect("/users/dashboard");
    });
  });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.Users.findOne({ where: { username } })
    .then((Users) => {
      bcrypt.compare(password, Users.password, (err, match) => {
        if (match) {
          // res.send('Logged in!');
          req.session.user = Users;
          res.redirect("/users/dashboard");
        } else {
          res.send("Incorrect Password");
        }
      });
    })
    .catch(() => {
      res.send("Username Not Found");
    });
});

 

router.post("/createpost", (req, res, next)=> {
  const values = { title:req.body.title,
  author:req.body.author,
  body_content:req.body.body_content};

db.Posts.create(values)
.then(function(user){ 
  // res.redirect("/users/dashboard");
  res.json(user);
});
});

//updates blog post
// router.put("/createpost/:id", (req, res, next)=> {
//   let values = { title:req.body.title,
//   author:req.body.author,
//   body_content:req.body.body_content};

// db.Posts.update(values)
// .then(function(user){
// res.redirect("/users/dashboard");
// });
// });


//deletes post
router.delete("/createpost/:post_id", (req, res, next)=> {
  const post_id = req.body.post_id;

  db.Posts.destroy({ where: { post_id: $1} })
  .then(rowsDeleted => {
    if (rowsDeleted === 1) {
      console.log('Deleted successfully');
    }
  })
  .catch(err => {
    console.log(err);
  });
});


module.exports = router;
