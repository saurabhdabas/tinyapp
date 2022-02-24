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
app.post('/login', function (req, res) {
  res.cookie("name",req.body.username);

  res.redirect("/urls")

})
app.post('/logout', function (req, res) {
  res.clearCookie("name");

  res.redirect("/urls")
})
app.get("/register", (req, res) => {
  res.render("user_registration");
  console.log("req.cookies:",req.cookies);
});
const findAUser = function(users,user_id){
  const userArray = Object.values(users);
  const getAUser = userArray.filter((user)=>{
    return  user.id === user_id
  });
  return getAUser[0]
}
const emailLooker = function(users,email){  
  const userArray = Object.values(users);
  for(let user of userArray){
    if(user.email === email){
      res.statusCode = 400;
      console.log("statusCode",res.statusCode)
      return ;
    }
  }
}
app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  users[randomID] = {    id: randomID, 
  email: req.body.email, 
  password: req.body.password }
  res.cookie("user_id", users[randomID].id)
  const user = findAUser(users,randomID);
  console.log(users);
  if(users[randomID].email === "" || users[randomID].password === ""  ){
    res.statusCode = 400 ;
    return ;
  }
  emailLooker(users,user.email);
  console.log(users);
  res.redirect("/urls");
});

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
  const templateVars = {username: req.cookies["name"] ,user :users[req.cookies.user_id]};
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