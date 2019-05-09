//requirements
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Book = require("../models").Book;
const sequelize = require("sequelize");

router.use(bodyParser.urlencoded({ extended: false }));
//Redirect to book route
router.get("/", (req, res) => {
  res.redirect("/books");
});
//Display all books
router.get("/books", (req, res, next) => {

  const searchTerms = {
    ...(req.query.title ? { title: { $like: `%${req.query.title}%` } } : {}),
    ...(req.query.author ? { author: { $like: `%${req.query.author}%` } } : {}),
    ...(req.query.genre ? { genre: { $like: `%${req.query.genre}%` } } : {}),
    ...(req.query.year ? { year: req.query.year } : {})
  };
  //current url, removes the page query and adds an & or ? when necesary, used for the pagination links
  const currentUrl =
    req.originalUrl.replace(/page=\d+&?|&page=\d+/, "") +
    (req.originalUrl.includes("?") ? "&" : "?");
  //gets the books from the database
  Book.findAll({
    //SELECT (all the columns except for createdAt and UpdatedAt)
    attributes: { exclude: ["createdAt", "updatedAt"] },
    //WHERE title LIKE "%title%" AND author LIKE "%author%" AND genre LIKE "%genre%" AND year = "year"
    where: searchTerms,
    //ORDER BY title ASC
    order: [["title", "ASC"]],
    // LIMIT 5
    limit: 5,
    // OFFSET page * 5
    offset: req.query.page ? parseInt(req.query.page) * 5 : 0
  })
    //Count books searched
    //SELECT COUNT(*) FROM books WHERE "previous search terms"
    .then(books =>
      Book.findAll({
        attributes: [[sequelize.fn("COUNT", sequelize.col("*")), "count"]],
        where: searchTerms
      })
        //Pages
        .then(count => Math.ceil(count[0].dataValues.count / 5))
        //Render the pug file with: all the books requested from the database
        .then(pages =>
          res.render("index", {
            data: books,
            ...req.query,
            pages,
            url: currentUrl
          })
        )
    )
    .catch(err => {
      err.status = 500;
      next(err);
    });
});
// GET route to create a new book
router.get("/books/new", (req, res) => {
  res.render("book", { newBook: true });
});
//POST route to create a new book
router.post("/books/new", (req, res, next) => {

  //INSERT INTO books VALUES (title, author, genre and year)
  Book.create(req.body)

    .then(book => res.redirect("/books"))

    .catch(err => {
      if (err.name === "SequelizeValidationError")
        res.render("book", { newBook: true, errors: err.errors, ...req.body });
      else throw err;
    })
    .catch(err => {
      err.status = 500;
      next(err);
    });
});
//GET route to show the book's details form
router.get("/books/:id", (req, res, next) => {
  Book.findById(req.params.id)
    .then(book => res.render("book", book.dataValues))
    .catch(err => {
      err.status = 404;
      next(err);
    });
});
//POST route to update a book
router.post("/books/:id", (req, res, next) => {
  //searches the book by id
  Book.findById(req.params.id)

    //UPDATE book SET title = "title", author = "author", genre = "genre", year = "year"
    .then(book => book.update(req.body))
    .then(() => res.redirect("/books"))
    .catch(err => {
      if (err.name === "SequelizeValidationError")
        res.render("book", {
          errors: err.errors,
          ...req.body,
          id: req.params.id
        });
      else throw err;
    })
    .catch(err => {
      err.status = 500;
      next(err);
    });
});
//Delete a book
router.post("/books/:id/delete", (req, res, next) => {

  Book.findById(req.params.id)

    .then(book => book.destroy())

    .then(() => res.redirect("/books"))
    .catch(err => {
      err.status = 500;
      next(err);
    });
});
router.use((req, res, next) => {
  error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});
//Display error Page
router.use((err, req, res, next) => {
  console.dir(err);
  res.status(err.status);
  if (err.status === 404) res.render("page_not_found");
  else if (err.status === 500) res.render("error");
});

module.exports = router;
