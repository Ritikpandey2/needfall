const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database'); // Use the PostgreSQL connection pool

const router = express.Router();

// Render signup page
router.get('/signup', (req, res) => {
  res.render('signup'); // Render signup page
});

// Handle signup logic
router.post('/signup', async (req, res) => {
  const { username, channel_name, email, password, gender, age } = req.body;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (username, channel_name, email, password, gender, age)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [username, channel_name, email, hashedPassword, gender, age];

  pool.query(query, values, (err, results) => {
    if (err) {
      console.error('Error during signup:', err);

      // Check for unique constraint violations
      if (err.code === '23505') { // PostgreSQL error code for unique violation
        if (err.detail.includes('username')) {
          res.send('Error: Username already exists. Please choose another.');
        } else if (err.detail.includes('channel_name')) {
          res.send('Error: Channel Name already exists. Please choose another.');
        } else if (err.detail.includes('email')) {
          res.send('Error: Email already exists. Please use another email.');
        }
      } else {
        res.send('An error occurred during signup. Please try again.');
      }
    } else {
      res.redirect('/login'); // Redirect to login page after successful signup
    }
  });
});

// Render login page
// router.get('/login', (req, res) => {
//   // Check if the user is already logged in
//   if (req.session.user) {
//     // If the user is logged in, pass user data to the view
//     res.render('login', { user: req.session.user });
//   } else {
//     // If the user is not logged in, just render the login page
//     res.render('login');
//   }
// });



router.get('/login', (req, res) => {
  if (req.session.user) {
    // If user is logged in, pass the user object to the view
    return res.render('login', { user: req.session.user });
  }
  // If no user is logged in, just render the login page without the user object
  res.render('login');
});


// Render login page
router.get('/login', (req, res) => {
  // Check if user is already logged in
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard'); // Redirect to dashboard if logged in
  }
  res.render('login'); // Render login page if not logged in
});

// Handle login logic
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = $1';
  pool.query(query, [email], async (err, result) => {
    if (err) {
      console.error('Error during login:', err);
      return res.send('An error occurred. Please try again.');
    }

    if (result.rows.length === 0) {
      return res.send('Invalid email or password.');
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.send('Invalid email or password.');
    }

    // Save user info in session
    req.session.userId = user.id;
    req.session.userName = user.username;

    // Persistent login using cookies
    res.cookie('userId', user.id, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }); // 30 days

    res.redirect('/dashboard'); // Redirect to the dashboard
  });
});

// Handle logout logic
router.get('/logout', (req, res) => {
  req.session.destroy(); // Destroy session
  res.clearCookie('userId'); // Clear persistent cookie
  res.redirect('/login'); // Redirect to login page
});

// Protected dashboard route
router.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Redirect to login if not logged in
  }
  res.send(`<h1>Welcome, ${req.session.userName}!</h1><a href="/logout">Logout</a>`); // Display dashboard
});


// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
