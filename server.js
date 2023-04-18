///Setup///----------------------------------------------------------------------------------------------------------------------------------------------------------------
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
.then(() => {
  console.log('Connected to DB');
  db = mongoose.connection;
})
.catch(err => console.log(err));


// Start server--------------------------------------------------------------------------------
//defines the port as 8080
const PORT = 8080;
//sets the server to listen on port 8080 and logs a message
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


///End of setup///----------------------------------------------------------------------------------------------------------------------------------------------------------------



///Get Routes///----------------------------------------------------------------------------------------------------------------------------------------------------------------

//sets up routes for navigation
app.get('/', function(req, res){
    
  //renders the SignIn page, this means that the user will always be brought here when the site is loaded
    res.render('pages/SignIn');

})

//gets the sign in function, calls req and res
app.get('/SignIn', function(req, res){

  //checks if the user has logged in
    if (req.session.loggedin) {

      //sets logs the user out of the session
        req.session.loggedin = false;

      //clears the current user
        req.session.currentuser = '';
      
      //renders the SignIn page
        res.render('pages/SignIn');
      }
    
    //if the user isnt logged in just render the sign in screen
    else{
        res.render('pages/SignIn');
    }
})



//when the app calls UserAccount this function is run
app.get('/Account', function(req, res){

  //if the user isnt logged in redirect them to the sign screen
    if (!req.session.loggedin) {
        res.render('pages/SignIn');
        return;
      }

      //if the user is logged in 
      else{
        
        //finds Quotes where the client is the logged in user and returns them to an array called ClientQuotes
        db.collection('Quotes').find({"Client": req.session.currentuser}).toArray(function (err, ClientQuotes) {
          if (err) throw err;

          //finds a single Quote where the logged in user is the Client and stores it in an array called FoundQuote
          db.collection('Quotes').findOne({"Client": req.session.currentuser}, function (err, FoundQuote) {
            if (err) throw err;
            //renders the user account and passes in the users 
           
            res.render('pages/Account', {Quotes: ClientQuotes, Quote: FoundQuote, User: req.session.currentuser})

          })
        });
      }
     })

//function gets called when the eventscheduler is requested
app.get('/QuoteBuilder', function(req, res){

  //checks if the user is logged in
  if (!req.session.loggedin) {

      //renders the sign in page
      res.render('pages/SignIn');
      return;
    }

    //if the user is logged in the quote builder is loaded
    else{
      res.render('pages/QuoteBuilder');
    }
})



////post requests/////-------------------------------------------------------------------------------------------------------------
