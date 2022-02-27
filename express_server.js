const express = require('express');
const { getUserByEmail, generateRandomString } = require('./helpers');
const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['LHL']
}));
const bcrypt = require('bcryptjs');

// A Database that contains urls where shortURL is the key and userID contains a random generated ID.

const urlDatabase = {

};

// A Database that contains a list of registered users .

const users = { 
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    password: '1234'
  },
 'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    password: '5678'
  }
}
//------------------------------------------>HELPERFUNCTIONS<--------------------------------------------//


// A Function that scan the urlDatabase to return the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (urlDatabase,id) => {
  let matchedURL = { };
  for (url in urlDatabase){
    if (urlDatabase[url].userID === id) {
      matchedURL[url] = urlDatabase[url];
    }
  }
  return matchedURL;
}
// Function allows me to create a new Entry to my urlDatabase
const addAUrlToDatabase = (urlDatabase,userID) =>{
  let newShortUrl = {};
  for(const shortURL in urlDatabase){
    if(urlDatabase[shortURL].userID === userID){
      newShortUrl[shortURL] = urlDatabase[shortURL]
    }
  }
  return newShortUrl;
}
// The Function helps to find a shortUrl in the database that matches to the one provided by user in the browser
const isShortUrl = (urlDatabase, id ) => {
  for(let userID in urlDatabase){
    if( id === userID){
      return true;
    }
  }
  return false;
}
//----------------------------------------------------------------> ROUTES <--------------------------------------------------- //
app.get('/', (req, res) =>{
  // If user is logged In 
  const IfUserIsLoggedIn = users[req.session.user_id];
  if(IfUserIsLoggedIn) {
    res.redirect('/urls');
    }
  else{ // If user is not logged In
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  addAUrlToDatabase(urlDatabase,req.session.user_id); // Adds a new entry to database
  const matchedURL = urlsForUser(req.session.user_id);
  const IfUserIsLoggedIn = users[req.session.user_id];
  if(matchedURL && IfUserIsLoggedIn){
    const templateVars = { urls: urlsForUser(urlDatabase,req.session.user_id), user: users[req.session.user_id]};
    res.render('urls_index',templateVars);
  }else{
    const templateVars = { urls:{ }, user: users[req.session.user_id]};
    res.render('urls_index',templateVars);
  }
});
app.get('/urls/new', (req, res) => {
  // If user is logged In 
  const IfUserIsLoggedIn = users[req.session.user_id]//This gives me an Object that has the email which matched to the provided email.
  if(IfUserIsLoggedIn){
    const templateVars = { user :users[req.session.user_id] };
    res.render('urls_new',templateVars);
  }else{ // If user is not logged In 
    res.redirect('/login');
  }
});
app.get('/urls/:id', (req, res) =>{
  const IfUserIsLoggedIn = users[req.session.user_id];//This gives me a user that has the email which matched to the provided email
  const userURLs = urlsForUser(urlDatabase,req.session.user_id);
  if(!isShortUrl(urlDatabase, req.params.id)){
    return res.send('<h1>The Path you are trying to access does not exist!</h1>');
  }
  if(!IfUserIsLoggedIn){
    return res.send('<h1>Login to Access the Path!</h1>');
  }
  if(isShortUrl(userURLs, req.params.id)){ 
    if(userURLs[req.params.id].userID == req.session.user_id){
      const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL ,user :users[req.session.user_id]};
      return res.render('urls_show', templateVars);
    }else{
      return res.send('<h1>The Path you are trying to access does not exist!</h1>');
    }
  }else{
    return res.send('<h1>The Path you are trying to access does not exist!</h1>');
  }
  
});
app.get('/u/:id', (req, res) => {
  if(isShortUrl(urlDatabase, req.params.id)){
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
  return res.send('<h1>The Path you are trying to access does not exist!</h1>');
});

app.post('/urls', (req, res) =>{
  const IfUserIsLoggedIn = users[req.session.user_id];//This gives me an Object that has the email which matched to the provided email
  if(IfUserIsLoggedIn){
    let longURL = req.body.longURL ;
    const shortURL = generateRandomString();
    urlDatabase[shortURL]= {longURL :longURL , userID : req.session.user_id };
    console.log('User Added a new shortUrl to the Database-->Updated UrlDatabase:',urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  }else{
    return res.send('<h1>The Path you are trying to access does not exist!</h1>');
  }
});
app.post('/urls/:id', (req, res) =>{
  const IfUserIsLoggedIn = users[req.session.user_id];//This gives me an Object that has the email which matched to the provided email
  const userURLs = urlsForUser(urlDatabase,req.session.user_id);
  if(!IfUserIsLoggedIn){
    return res.send('<h1>Login to Access the Path!</h1>');
  }
  if(userURLs[req.params.id].userID == req.session.user_id){
    const short = req.params.id;
    urlDatabase[short]={longURL:req.body.longURL , userID : req.session.user_id};
    return res.redirect('/urls/');
  }
  else{
    return res.send('<h1>Login to Access the Path!</h1>');
  }
});
app.post('/urls/:id/delete', (req, res) =>{
  const IfUserIsLoggedIn = users[req.session.user_id];//This gives me an Object that has the email which matched to the provided email
  const userURLs = urlsForUser(urlDatabase,req.session.user_id);
  if(!IfUserIsLoggedIn){
    return res.send('<h1>Login to Access the Path!</h1>');
  }
  if(userURLs[req.params.id].userID == req.session.user_id){
    const shortURL = req.params.id;
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  else{
    return res.send('<h1>Login to Access the Path!</h1>');
  }
});
app.get('/login', function (req, res){
  const IfUserIsLoggedIn = users[req.session.user_id];//This gives me an Object that has the email which matched to the provided email
  if(!IfUserIsLoggedIn){
    const templateVars = { urls: urlDatabase , user : users[req.session.user_id]};
    return res.render('user_login',templateVars)
  }else{
    return res.redirect('/urls');
  }
})

app.get('/register', (req, res) => {
  const IfUserIsLoggedIn = users[req.session.user_id];//This gives me an Object that has the email which matched to the provided email
  if(!IfUserIsLoggedIn){
    const templateVars = { urls: urlDatabase ,user :users[req.session.user_id]};
    return res.render('user_registration',templateVars)
  }else{
    return res.redirect('/urls');
  }
});

// When user tries to login 
app.post('/login', function (req, res) {
  const userID = getUserByEmail(req.body.email, users); // returns a userID that matches to the one that has a same email
  const userInDatabase = users[userID] ;// This gives me the user that has the email which matched to the provided email.
  const password = req.body.password ;
  // Checks if the user filled all the fields 
  if(req.body.email === '' || req.body.password === ''){
    return res.status(400).send('Please Fill up all fields!');
  }
  // Checks if user exists in the database 
  if(userInDatabase){
    const passwordCheck = bcrypt.compareSync(password,userInDatabase.password);
    if (passwordCheck) {
      console.log('User is Successfully Logged In');
      req.session.user_id = userInDatabase.id;
      return res.redirect('/urls');
    }
    else{ 
      return res.status(400).send('<h1>Passwords does not match!Try Again</h1');
    }
  }
  else {
    return res.status(400).send('<h1>User does not Exist!</h1>');
  }
})
// We set a registered user with a Cookie ID. Also, handle registration errors .
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password ;
  const user = getUserByEmail(email,users);
  // Checks if the email && password fields are empty , if the fields are empty send a 400 Error.
  if(email === '' || password === ''){
    return res.status(400).send('<h1>Please Fill up all fields!</h1>');
  }
  // Checks if user Already Exists. If user tries to re register with same email , send a 400 Error.
  if(user){
    return res.status(400).send('<h1>User Already Exists!</h1>');
  }
  // Registering  a new User to the user Database .
  const randomID = generateRandomString(); 
  users[randomID] = {  id: randomID, email: email, password: bcrypt.hashSync(password,10) };
  req.session.user_id = randomID ;
  console.log('Registration Message : User successfully registered');
  console.log('Updated Database after a user Registered',users);
  return res.redirect('/urls');
});

// When user presses on logout button, it clears the cookie and redirects user to /urls .
app.post('/logout', function (req, res){
  console.log('Cookie is cleared:User redirected to homepage');
  console.log('User is successfully Logged Out');
  req.session = null;
  return res.redirect('/urls')
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});