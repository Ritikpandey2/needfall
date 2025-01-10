const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

// Set up middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Use default session store
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days session persistence
  })
);

// Middleware to handle persistent login via cookies
app.use((req, res, next) => {
  if (!req.session.userId && req.cookies.userId) {
    req.session.userId = req.cookies.userId;
    req.session.userName = req.cookies.userName; // Assuming you save the username as well
  }
  next();
});

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Use the auth routes
app.use('/', authRoutes);

// Root route - Redirect all requests to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
