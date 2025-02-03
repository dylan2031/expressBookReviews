const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    return users.some(user => user.username === username);
}
  
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (username && password) {
        if (!doesExist(username)) { 
            users.push({ "username": username, "password": password });
            return res.status(201).json({ message: "User successfully registered. Now you can log in" });
        } else {
            return res.status(409).json({ message: "User already exists!" });    
        }
    } 
    return res.status(400).json({ message: "Unable to register user. Username and/or password not provided" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    res.status(200).json(books);
});

// Get the user list available in the shop
public_users.get('/users', (req, res) => {
    res.status(200).json(users);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    book ? res.status(200).json(book) : res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found.` });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const filteredBooks = Object.values(books).filter(book => book.author === req.params.author);
    filteredBooks.length ? res.status(200).json(filteredBooks) : res.status(404).json({ message: `No books found by author ${req.params.author}.` });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const filteredBooks = Object.values(books).filter(book => book.title === req.params.title);
    filteredBooks.length ? res.status(200).json(filteredBooks) : res.status(404).json({ message: `No books found with title ${req.params.title}.` });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    book ? res.status(200).json(book.reviews || []) : res.status(404).json({ message: `Book with ISBN ${req.params.isbn} not found.` });
});

module.exports.general = public_users;
