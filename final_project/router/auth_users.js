const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [
    { "username": "steve", "password": "test" },
    { "username": "eric", "password": "test123" },
    { "username": "olivia", "password": "testtest" }
];

const isValid = (username) => {
    return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { username },
            process.env.JWT_SECRET || 'access',
            { expiresIn: "1h" }
        );

        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username and password" });
    }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.session.authorization?.username;

    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    if (!username || !review) {
        return res.status(400).json({ message: "Review or username is missing" });
    }

    book.reviews = book.reviews || [];
    const existingReview = book.reviews.find(r => r.username === username);
    
    if (existingReview) {
        existingReview.review = review;
        return res.status(200).json({ message: `Review updated for ${username} on book ${isbn}` });
    } else {
        book.reviews.push({ username, review });
        return res.status(201).json({ message: `Review added for ${username} on book ${isbn}` });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    if (!username) {
        return res.status(401).json({ message: "User is not authenticated. Please log in." });
    }

    book.reviews = book.reviews || [];
    const reviewIndex = book.reviews.findIndex(r => r.username === username);

    if (reviewIndex !== -1) {
        book.reviews.splice(reviewIndex, 1);
        return res.status(200).json({ message: `Review deleted for ${username} on book ${isbn}` });
    } else {
        return res.status(404).json({ message: `No review found for user ${username} on book ${isbn}` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
