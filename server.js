const express = require('express');
const mongoose = require('mongoose');

// Connect to Mongo Atlas database
mongoose.connect('mongodb+srv://Admin:Admin@EnterpriseWebIS.mongodb.net/CourseworkIS?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Create Express app
const app = express();

// Serve static files from the GitHub repository
app.use(express.static('https://github.com/Iansm21/Enterprise-web-systems.git'));

// Define routes for web pages
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/account', (req, res) => {
  res.sendFile(__dirname + '/account.html');
});

// Define API routes for interacting with database
app.get('/api/quotes', (req, res) => {
  // TODO: Get all quotes from database and return as JSON
});

app.post('/api/quotes', (req, res) => {
  // TODO: Create new quote in database and return as JSON
});

app.delete('/api/quotes/:id', (req, res) => {
  // TODO: Delete quote with given ID from database
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
