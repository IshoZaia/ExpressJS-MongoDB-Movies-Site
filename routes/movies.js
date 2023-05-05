const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const movie = require("../models/movie");

let Movie = require("../models/movie");
let User = require("../models/user");

let genres = [
    "adventure",
    "science fiction",
    "tragedy",
    "romance",
    "horror",
    "comedy",
  ];

router
  .route("/search")
  .get((req, res) => {
    res.render("search")
  })
  .post(async (req, res) => {
    await check("name", "A name is required").notEmpty().run(req)
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        let movie = await Movie.findOne({"name": req.body.name})
        if (!movie){
            res.send("No movie found")
        }
        else {
            res.render("searched", {
                movie: movie
            })
        }
    }
    else{
        res.render("search", {
            errors: errors.array()
        })
    }
  })

router
  .route("/add")
    .get(ensureAuthenticated, (req, res) => {
     res.render("add_movie", {
      genres: genres,
    });
  })
  .post(ensureAuthenticated, async (req, res) => {
    // Async validation check of form elements
    await check("name", "Name is required").notEmpty().run(req);
    await check("description", "Description is required").notEmpty().run(req);
    await check("year", "Year is required").notEmpty().run(req);
    await check("rating", "Rating is required").notEmpty().run(req);
    await check("genres", "Genre is required").notEmpty().run(req);

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      let movie = new Movie();
      movie.name = req.body.name;
      movie.description = req.body.description;
      movie.year = req.body.year;
      movie.genres = req.body.genres;
      movie.rating = req.body.rating;
      movie.posted_by = req.user.id;

      let result =  await movie.save()
      if (!result) {
        res.send("Could not save movie")
      } else {
        res.redirect("/");
      }
    } else {
      res.render("add_movie", {
        errors: errors.array(),
        genres: genres,
      });
    }
  });
  router
  .route("/:id")
  .get(async (req, res) => {
    let movie = await Movie.findById(req.params.id)
    console.log(movie)
    if(!movie){
      res.send("Could not find movie")
    }
    let user = await User.findById(movie.posted_by)
    if (!user) {
      res.send("Could not find user")
    } else {
        console.log(user.name)
        res.render("movie", {
          movie: movie,
          posted_by: user.name,
        });
      };
    })
  .delete(async (req, res) => {
    if (!req.user._id) {
      res.status(500).send();
    }

    let query = { _id: req.params.id };

    let movie = await Movie.findById(req.params.id)
    if(!movie){
      res.send("Could not find movie")
    }
    if (movie.posted_by != req.user._id) {
      res.status(500).send();
    } else {
      let result = Movie.deleteOne(query, function (err) {
      if (!result) {
        res.status(500).send();
      }
      res.send("Successfully Deleted");
      });
    }
    });

    router
  .route("/edit/:id")
  .get(ensureAuthenticated, async (req, res) => {
    let movie = await Movie.findById(req.params.id)
      if(!movie){
        res.send("Could not find movie")
      }
      if (movie.posted_by != req.user._id) {
        res.redirect("/");
      }
      res.render("edit_movie", {
        movie: movie,
        genres: genres,
      });
    })
  .post(ensureAuthenticated, async (req, res) => {
    let movie = {};
    movie.name = req.body.name;
    movie.description = req.body.description;
    movie.year = req.body.year;
    movie.genres = req.body.genres;
    movie.rating = req.body.rating;

    let query = { _id: req.params.id };

    let movie_db = await Movie.findById(req.params.id)
    if(!movie_db){
      res.send("Could not find movie")
    }
    console.log(movie_db)
    if (movie_db.posted_by != req.user._id) {
      res.send("Only user who posted the movie can edit")
    } else {
      let result = await Movie.updateOne(query, movie)
        if (!result) {
          res.send("Could not update movie")
        } else {
          res.redirect("/");
        }
    }
  })

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/users/login");
    }
  }
  
  module.exports = router;