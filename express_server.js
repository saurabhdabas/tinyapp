// A function that generates a random string 
function generateRandomString() {
  return Math.random().toString(30).substring(2,8);
}

const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
app.use(cookieParser());
const cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ["LHL"]
}))
const bcrypt = require('bcryptjs');

// A Database that contains urls where shortURL is the key and userID contains a random generated ID.

const urlDatabase = {

};

// A Database that contains a list of registered users .

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "5678"
  }
}
// A function that loops over the users database to check if email provided by user already exists
const getAUserByEmail = ( email , users ) => {
  for( const userID in users){
    if(users[userID].email === email){
      console.log("getAUserByEmail",userID)
      return userID;
    }
  }
  return null ;
}
// A Function that scan the urlDatabase to return the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (database,id) => {
  let matchedURL = { }
  for (url in urlDatabase){
    console.log("URL:",url);
    if (urlDatabase[url].userID === id){
      console.log("matchedURL:",url);
      matchedURL[url] = urlDatabase[url];
    }
  }
  return matchedURL;
}
// All the Routes that user can send a request to.
app.get("/", (req, res) =>{
  // If user is logged In 
  const userID = getAUserByEmail(req.body.email,users); // returns a userID that matches to the one that has a same email
  const loginInUser = users[userID] // This gives me an Object that has the email which matched to the provided email.
  const password = req.body.password ;
  if(loginInUser){
    if(loginInUser.password === password){
      res.redirect("/urls")
    }
  }else{ // If user is not logged In
    res.redirect("/login");
  }
});

// Gets the Registration Page 
app.get("/register", (req, res) => {
  // templateVars are served two things through the urls variable and the user variable : 1. The urlDatabase 2. user 
  const templateVars = { urls: urlDatabase ,user :users[req.session.user_id]};
  res.render("user_registration",templateVars);

});
// We set a registered user with a Cookie ID. Also, handle registration errors .
app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password ;
  const user = getAUserByEmail(email,users)
  // Checks if the email && password fields are empty , if the fields are empty send a 400 Error.
  if(email === "" || password === ""){
    return res.status(400).send("Please Fill up all fields!")
  }
  // Checks if user Already Exists. If user tries to re register with same email , send a 400 Error.
  if(user){
    return res.status(400).send("User Already Exists!")
  }
  // Registering  a new User to the user Database .
  const randomID = generateRandomString(); 
  users[randomID] = {  id: randomID, email: email, password: bcrypt.hashSync(password,10) }
  // res.cookie("user_id", randomID) // A cookie with name : user_id is set to that randomID.
  req.session.user_id = randomID ;
  console.log("Registration Message : User successfully registered");
  console.log("Updated Database after a user Registered",users);
  res.redirect("/urls");
});

// Gets the Login page 
app.get('/login', function (req, res) {
  // templateVars are served two things through the urls variable and the user variable : 1. The urlDatabase 2. user 
  const templateVars = { urls: urlDatabase , user : users[req.session.user_id]};
  res.render("user_login",templateVars)
})

// When user tries to login 
app.post('/login', function (req, res) {
  const userID = getAUserByEmail(req.body.email, users); // returns a userID that matches to the one that has a same email
  const loginInUser = users[userID] // This gives me an Object that has the email which matched to the provided email.
  const password = req.body.password ;
  // Checks if the user filled all the fields 
  if(req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Please Fill up all fields!")
  }
  // Checks if user is Logged In or not 
  if(loginInUser){
    const passwordCheck = bcrypt.compareSync(password,loginInUser.password);
    console.log(passwordCheck);
    if (passwordCheck){
      console.log("User is Successfully Logged In")
      // res.cookie('user_id',loginInUser.id); // Here I have set the cookie to match with cookie user_id which was actually randomID
      req.session.user_id = loginInUser.id;
      res.redirect('/urls');
    }
    else{ 
      return res.status(400).send("Passwords does not match!Try Again")
    }
  }
  else {
    return res.status(400).send("User doesn't Exist!")
  }
})
// When user presses on logout button, it clears the cookie and redirects user to /urls .
app.post('/logout', function (req, res){
  console.log("Cookie is cleared:User redirected to homepage")
  req.session = null;
  res.redirect("/urls")
})
// Function allows me to create a new Entry to my urlDatabase
const addAUrlToDatabase = (database,userID) =>{
  let newShortUrl = {};
  for(const shortURL in database){
    if(database[shortURL].userID === userID){
      newShortUrl[shortURL] = database[shortURL]
    }
  }
  return newShortUrl ;
}
app.get("/urls", (req, res) => {
  addAUrlToDatabase(urlDatabase,req.session.user_id) // Adds a new entry to database
  console.log("req.cookie.id:",req.session.user_id);
  console.log("Line ----> 157",urlsForUser(req.session.user_id));
  const matchedURL = urlsForUser(req.session.user_id);
  if(matchedURL){
    const templateVars = { urls: urlsForUser(urlDatabase,req.session.user_id), user: users[req.session.user_id]};
    res.render("urls_index",templateVars)
  }else{
    const templateVars = { urls:{ }, user: users[req.session.user_id]};
    res.render("urls_index",templateVars)
  }
});

app.post("/urls", (req, res) =>{
  let longURL = req.body.longURL ;
  const shortURL = generateRandomString();
  urlDatabase[shortURL]= {longURL :longURL , userID : req.session.user_id };
  console.log("User Added a new shortUrl to the Database-->Updated UrlDatabase:",urlDatabase);
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls/new", (req, res) => {
  // If user is logged In 
  const IfUserIsLoggedIn = users[req.session.user_id]//This gives me an Object that has the email which matched to the provided email.
  if(IfUserIsLoggedIn){
    const templateVars = { user :users[req.session.user_id] };
    res.render("urls_new",templateVars);
  }else{ // If user is not logged In 
    res.redirect("/login");
  }
});
// The Function helps to find a shortUrl in the database that matches to the one provided by user in the browser
const findAShortUrl = (urlDatabase, id ) => {
  for(let userID in urlDatabase){
    if( id === userID){
      return true
    }
  }
  return false;
}
app.get("/u/:id", (req, res) => {
  if(findAShortUrl(urlDatabase, req.params.id)){
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
  return res.send("The Path you are trying to access does not exist!")
});
app.get("/urls/:id", (req, res) => {
  console.log("req.params.id:",req.params.id); //****/ -----> This is here to debug the error in line 157 . not redirecting.
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL ,user :users[req.session.user_id]};
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  const short = req.params.id
  urlDatabase[short]={longURL:req.body.longURL , userID : req.session.user_id};
  res.redirect("/urls/")
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req);
  const shortURL = req.params.id
  console.log(urlDatabase[shortURL])
  delete urlDatabase[shortURL]
  res.redirect("/urls")
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});