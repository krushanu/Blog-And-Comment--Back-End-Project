const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require("bcrypt");

// GET users listening
router.get("/signup", function (req, res, next) {
  res.render("signup.ejs", { title: "Sign Up" });
});

router.get("/login", function (req, res, next) {
  res.render("login.ejs", { title: "Login" });
});

router.get("/dashboard", function (req, res, next) {
  db.Posts.findAll().then(function (Posts) {
    res.render("dashboard.ejs", {
      title: "Blog Repository",
      user: req.session.user || null,
      email: req.session.user || null,
      Posts: Posts,
    });
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
          console.log(req.session.user.id);
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

router.get("/createpost2", function (req, res, next) {
  res.render("createpost2.ejs", {
    user: req.session.user.username.replace(/['"]+/g, "") || null,
  });
});

router.post("/createpost2", (req, res, next) => {
  console.log(req.body);
  const values = {
    title: req.body.title,
    author: req.body.username,
    body_content: req.body.body_content,
  };
  db.Users.findByPk(req.session.user.id)
    .then((user) => {
      user.createPost(values);
    })
    .then(res.redirect("/users/dashboard"));
  // db.Posts.create(values).then(function (user) {
  // res.redirect("/users/dashboard");
  // res.json(user);
});
// });

// updates blog post
router.put("/createpost2/:id", (req, res, next) => {
  db.Posts.findByPk(parseInt(req.params.id)).then(function (post) {
    post.title = req.body.title;
    post.author = req.body.author;
    post.body_content = req.body.body_content;
    post.save().then((result) => {
      console.log(result);
      res.redirect("/users/dashboard");
    });
  });
});

//deletes post
router.delete("/createpost2/:post_id", (req, res, next) => {
  const post_id = req.params.post_id;

  db.Posts.destroy({ where: { id: parseInt(post_id) } })
    .then((rowsDeleted) => {
      if (rowsDeleted === 1) {
        console.log("Deleted successfully");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
