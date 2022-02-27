//------------------------------------------>HELPERFUNCTIONS<--------------------------------------------//
// A function that loops over the users database to check if email provided by user already exists
const getUserByEmail = ( email , users ) => {
  for( const userID in users){
    if(users[userID].email === email){
      console.log('getUserByEmail',userID)
      return userID;
    }
  }
  return null ;
}
// A function that generates a random string 
const generateRandomString = () => {
  return Math.random().toString(30).substring(2,8);
};

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


module.exports = { getUserByEmail, generateRandomString, urlsForUser, addAUrlToDatabase, isShortUrl };