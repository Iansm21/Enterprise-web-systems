//Setup//--------------------------------------------------------------------------------
//express setup------------------------------------------------------------------------- 
const express = require('express');
const app = express();

//sets up express session so that the user can remain signed in
const session = require('express-session'); 

//sets up the body parser
const bodyParser = require('body-parser');

app.use(express.urlencoded({extended: true}))

//sets the view engine to ejs so we can make use of templates
app.set('view engine', 'ejs');

//allows the use of static elements
app.use(express.static('public'));

//variable to hold the database
var db;

app.use(session({
    secret : 'Assessment',
    resave: true,
    saveUninitialized: true
  }));

  
//tells express we want to read posted forms
app.use(bodyParser.urlencoded({
    extended: true
  }))

app.use(bodyParser.json());

app.use(function(req, res, next){
  res.locals.username = req.session.currentuser
  next();
  })



//MongoDB setup--------------------------------------------------------------------------------
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://Admin:Admin@EnterpriseWebIS.mongodb.net/CourseworkIS?retryWrites=true&w=majority';

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to DB'))
.catch(err => console.log(err));

// Add error handling for MongoDB connection
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(-1);
});



// Start server--------------------------------------------------------------------------------
//defines the port as 8080
const PORT = 8080;
//sets the server to listen on port 8080 and logs a message
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


