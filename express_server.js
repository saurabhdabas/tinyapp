function generateRandomString() {
  return Math.random().toString(30).substring(2,8);
}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
const res = require("express/lib/response");
app.use(cookieParser());

// This line of code registers a handler on the root path, "/".
app.get("/", (req, res) => {
  res.send("Hello!");
});
// This line of code registers a handler on the  path, "/urls.json".
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase ,user :users[req.cookies.user_id]};
  res.render("user_registration",templateVars);

});
const findAUser = function(users,user_id){
  const userArray = Object.values(users);
  const getAUser = userArray.filter((user)=>{
    return  user.id === user_id
  });
  // console.log(getAUser);
  return getAUser[0]
}
// A function that loops over the users database to check if email provided by user already exists

const emailLooker = function(users,email){
  for(let user in users){
    if(users[user].email === email){
      console.log(user);
      return true
    }
  }
}
app.post("/register", (req, res) => {
  const userAlreadyExists = emailLooker(users,req.body.email)
  if(userAlreadyExists){
    return res.status(400).send("User Already Exists!")
  }
  else if(req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Please Fill up all fields!")
  }
  else{
    const randomID = generateRandomString();  // Created a random ID which is used to create an new user object inside the users database
    users[randomID] = {    id: randomID, 
    email: req.body.email, 
    password: req.body.password }
    res.cookie("user_id", users[randomID].id) // A cookie is set to that randomID.
    const user = findAUser(users,randomID); // find a user with that cookie: user_id in the database
    res.redirect("/urls/new");
  }
  // console.log(users);
});

app.get('/login', function (req, res) {
  const templateVars = { urls: urlDatabase , user :users[req.cookies.user_id]};
  // console.log(users);
  res.render("user_login",templateVars)
})
app.post('/login', function (req, res) {
  if(req.body.email === "" || req.body.password === ""){
    return res.status(400).send("Please Fill up all fields!")
  }
  else{
    const userFound = emailLooker(users,req.body.email)
    if(userFound){
      console.log("userFound",userFound)
      for(let user in users){
        console.log("userEnteredPass;",req.body.password);
        if(users[user].password === req.body.password){
          console.log("userFoundWithSameEmail",users[user].password);
          console.log("cookieID;",req.cookies.user_id);
          console.log("user_id;",users[user].id);
          req.cookies.user_id = users[user].id
          res.redirect("/urls")
        }
      }
      return res.status(403).send("Password entered is incorrect! Try Again.")
    }
    return res.status(403).send("Email entered is incorrect! Try Again.")
  }
})
app.post('/logout', function (req, res) {
  // console.log("users:",users);
  res.clearCookie("user_id");
  res.redirect("/urls")
})
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase ,user :users[req.cookies.user_id]};
  res.render("urls_index",templateVars)
});

app.post("/urls", (req, res) => {

  let longURL = req.body.longURL ;
  const shortURL = generateRandomString();
  urlDatabase[shortURL]=longURL ;
  res.redirect(`/urls/${shortURL}`)
});
app.get("/urls/new", (req, res) => {
  const templateVars = {user :users[req.cookies.user_id]};
  console.log(templateVars);
  res.render("urls_new",templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],user :users[req.cookies.user_id]};
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  console.log(req);  // Log the POST request body to the console
  const id = req.params.id
  urlDatabase[id]=req.body.longURL;
  res.redirect("/urls/")
});
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req);
  const shortURL = req.params.shortURL
  console.log(urlDatabase[shortURL])
  delete urlDatabase[shortURL]
  res.redirect("/urls")
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});