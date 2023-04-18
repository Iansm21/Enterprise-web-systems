////Setup/////-------------------------------------------------------------------------------------------------------------
//sets up mongodb
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/amalgadb";

//sets up express
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
    secret : 'example',
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

////End of App Setup/////-------------------------------------------------------------------------------------------------------------


////Get Routes////-------------------------------------------------------------------------------------------------------------

//sets up routes for navigation
app.get('/', function(req, res){
    
  //renders the SignIn page, this means that the user will always be brought here when the site is loaded
    res.render('pages/SignIn');

})

//decides what to serve when /Signup is retrieved
app.get('/SignUp', function(req,res){

  //Renders the Signup page
    res.render('pages/SignUp');
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
app.get('/UserAccount', function(req, res){

  //if the user isnt logged in redirect them to the sign screen
    if (!req.session.loggedin) {
        res.render('pages/SignIn');
        return;
      }

      //if the user is logged in 
      else{
        
        //finds events where the author is the logged in user and returns them to an array called owned
        db.collection('events').find({"author": req.session.currentuser}).toArray(function (err, owned) {
          if (err) throw err;

          //finds a single event where the logged in user is the author and stores it in an array called evenfound
          db.collection('events').findOne({"author": req.session.currentuser}, function (err, eventfound) {
            if (err) throw err;
            
            //finds events the user is attending by searching an array for the current user and stores them as attending
            db.collection('events').find({"attendingusers": req.session.currentuser}).toArray(function(err, attending) {
              if (err) throw err;


              //finds a single event the user is attending by searching an array for the current user and storing it in attendeefound
              db.collection('events').findOne({"attendingusers": req.session.currentuser}, function (err, attendeefound) {
                if (err) throw err;

                //renders the user account and passes in the users attending, owned events and username 
                res.render('pages/UserAccount', {ownedevents: owned, ownedevent: eventfound, userdata: req.session.currentuser, attendingevents: attending, attendingevent: attendeefound   })
          
              });
        
            });
      
          });

        
        });

      }
     })

//get method for showing the events page 
app.get('/Events', function(req, res){

    //if the user hasnt logged in, render the sign in page
    if (!req.session.loggedin) {

        //renders the sign in page
        res.render('pages/SignIn');
        return;
      }

      //if user is logged in
      else{

        //finds all events in the db and stores them in all
        db.collection('events').find().toArray(function(err, all) {
              if (err) throw err;

              //finds an event and stores it in single
              db.collection('events').findOne({}, function (err, single) {
                if (err) throw err;
                //renders the events page with all the events on the site
                res.render('pages/Events', {events: all, event: single})
              })
      });
    }
    })

//function gets called when the eventscheduler is requested
app.get('/EventScheduler', function(req, res){

    //checks if the user is logged in
    if (!req.session.loggedin) {

        //renders the sign in page
        res.render('pages/SignIn');
        return;
      }
      //if the user is logged in the eventscheduler is loaded
      else{
        res.render('pages/EventScheduler');
      }
})

////end of get routes/////-------------------------------------------------------------------------------------------------------------

//sets up the database
MongoClient.connect(url, function(err, database){
    if (err) throw err;
    //defines db as our database
    db = database

    //tells the application to listen on port 8080
    app.listen(8080);

    //lets us know that the site is running as expected
    console.log("Amalgamate is looking good!")
});

////post requests/////-------------------------------------------------------------------------------------------------------------

//when the login form is submitted this function is called 
app.post('/dologin', function (req, res) {
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
            console.log("user not found :(")
            return
          }

        //checks if the users password matches the one stored in the database
        if (result.password == pword) {

            //logs the user in
            req.session.loggedin = true;

            //sets the current user to uname
            req.session.currentuser = uname;
            
            //redirects the user to their account
            res.redirect('/UserAccount');
            //message in the console to let us know someone logged in
            console.log("a user was recognised, horay!")
        
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
    db.collection('users').findOne({"username": uname}, function (err, result) {
        if (err) throw err;

        //if the username is not found in the collection create a new user and log them in
        if (!result) {
            //saves the new user into the database
            db.collection('users').save(newuser, function (err, result){
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
app.post('/insertevent', function(req, res){

  //creates a variable to pass all the event information to the database
  var newevent = {
  "name" : req.body.name,
  "location" : req.body.location,
  "description" : req.body.description,
  "date" : req.body.date,

  "author" : req.session.currentuser,
  "createdon" : Date(),
  "attendingusers" : []
  }

  //reads the events name from the body parser
  var eventname = req.body.name

  //checks if an event with the same name exists
  db.collection('events').findOne({"name" : eventname}, function (err, result){
    if (err) throw err;

    //if no event is found the event is created and the user is redirected to the events screen
    if (!result){
      db.collection('events').save(newevent, function(err, result){
        if (err) throw err;
        console.log('event created!')
        res.redirect('/events')
    
      })
    }
    //if the events name is already in the database redirect to the event builder
    else{
      console.log("event name already taken!")
      res.redirect('/EventScheduler')

    }
  })

//function called when the user marks attendance on an event
app.post('/attend', function(req, res){
  
  //reads the events name and stores it in the eventnm variable
  var eventnm = req.body.eventname
  
  //gets the current user and stores it in the array
  var user = req.session.currentuser


  //displays values in the console for troubleshooting
  console.log(JSON.stringify(eventnm))
  console.log(JSON.stringify(user))

  //adds the users name to the list of attendees on the selected event
  db.collection('events').updateOne(
    { name: eventnm },
    { $push: { attendingusers: user } }
 )
 
 //reloads the events page
 res.redirect("/events")

  });

//function called when the user deletes a post
app.post('/delete', function(req, res){

  //gets the events name
  var eventnm = req.body.eventname
  //gets teh events author
  var auth = req.body.eventauthor

  //deletes the event
  db.collection('events').deleteOne( { "name": eventnm, "author": auth} )

  //reloads the users account
  res.redirect("/UserAccount")

});

//function that gets called when the user removes attendance
app.post('/remove', function(req, res){

  //gets the events name
  var eventnm = req.body.eventname
  //gets the current user
  var user = req.session.currentuser
  
  //returns to the console for troubleshooting
  console.log(JSON.stringify(eventnm))
  console.log(JSON.stringify(user))

  //updates the event and removes the users name from the attending users list
  db.collection('events').updateOne(
    { name: eventnm },
    { $pull: { attendingusers: user } }
 )
 //redirects the user to their account
 res.redirect("/UserAccount")

  })

});

////---------------------------------------------------------------------------------------------------------------------------------------------------------------------