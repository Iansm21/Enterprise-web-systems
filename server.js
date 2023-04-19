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

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://Admin:Admin@EnterpriseWebIS.mongodb.net/CourseworkIS';

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

//when the login form is submitted this function is called 
app.post('/login', function (req, res) {
  console.log(JSON.stringify(req.body))
  //reads the username from the body into a constant
  const uname = req.body.username;
  //reads the password from the password field
  var pword = req.body.password;

  //searches for the user in the database
  db.collection('users').findOne({
      "username": uname
  }, function (err, result) {
      if (err) throw err;

      //redirects the user to the sign in page again if a user isnt found
      if (!result) {
          res.redirect('/SignIn');
          console.log("user not found, check credentials")
          return
        }

      //checks if the users password matches the one stored in the database
      if (result.password == pword) {

          //logs the user in
          req.session.loggedin = true;

          //sets the current user to uname
          req.session.currentuser = uname;
          
          //redirects the user to their account
          res.redirect('/Account');
          //message in the console to let us know someone logged in
          console.log("a user was recognised, welcome!")
      
      //redirects the user to sign in again if the user isnt found
      }else{
          res.redirect('/SignIn')
          console.log("user not found :(")
      }
  });
});


//post request used to create a user, is called when a user creates an account
app.post('/createauser', function(req, res){
  console.log(JSON.stringify(req.body))
  var uname = req.body.username;
  var pword = req.body.password;

  //creates a variable holding the new users login details
  var newuser = {
      "username" : uname,
      "password" : pword
  }

  //checks if the username is already in the database
  db.collection('Users').findOne({"username": uname}, function (err, result) {
      if (err) throw err;

      //if the username is not found in the collection create a new user and log them in
      if (!result) {
          //saves the new user into the database
          db.collection('Users').save(newuser, function (err, result){
              if (err) throw err;
              console.log("user created! :)")
              req.session.loggedin = true;
              req.session.currentuser = uname;
              res.redirect('/UserAccount');
          })
          return;
        }
        // if the user is found then they will be brought back to the signup screen
        else{
          console.log("user already exists!")
          res.render('pages/SignUp')
        }
      }
  )
});




//function called when the user creates an event
app.post('/AddQuote', function(req, res){

  //creates a variable to pass all the event information to the database
  var newquote = {
  "ProjectName" : req.body.name,
  "Developer" : req.body.dev,
  "Days" : req.body.days,
  "FinalBudget" : req.body.price,
  "Client" : req.session.currentuser
  }

  //reads the events name from the body parser
  var projectname = req.body.name

  //checks if a Quote with the same name exists for the logged in user
  db.collection('Quotes').findOne({"ProjectName" : projectname, "Client": req.session.currentuser}, function (err, result){
    if (err) throw err;

    //if no Quote is found the Quote is created and the user is redirected to the Account screen
    if (!result){
      db.collection('Quotes').save(newquote, function(err, result){
        if (err) throw err;
        console.log('Quote Saved!')
        res.redirect('/Account')
    
      })
    }
    //if the events name is already in the database redirect to the event builder
    else{
      console.log("Please ensure that you haven't already used that project title!")
      res.redirect('/QuoteBuilder')

    }
  })
});


//function called when the user deletes a quote
app.post('/deleteQuote', function(req, res){

  //gets the quotes title
  var eventnm = req.body.name
  //gets the quotes client
  var client = req.session.currentuser

  //deletes the quote
  db.collection('Quotes').deleteOne( { "ProjectName": eventnm, "Client": client} )

  //reloads the users account
  res.redirect("/Account")

});
