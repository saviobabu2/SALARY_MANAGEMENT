const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const engine = require('ejs-mate');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const database = require('./config/db');


// Load environment variables
database.dbConnect(); 



// Route imports
const adminRoutes = require('./routes/adminRoutes');




// View engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
  })
);

app.use(expressLayouts);

// Set default layout
app.set('admin-layout', 'layouts/admin-layout'); 


// Route Middleware     
app.use('/admin', adminRoutes);   // Admin pages


// Handle 404
app.use((req, res, next) => {
  res.status(404).render('public/404', { title: "Page Not Found" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}/admin/`);
});







