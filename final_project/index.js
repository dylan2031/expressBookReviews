const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
require('dotenv').config(); // Load environment variables

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization && req.session.authorization.accessToken) {
        let token = req.session.authorization.accessToken;

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
