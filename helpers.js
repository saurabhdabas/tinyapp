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

module.exports = { getUserByEmail , generateRandomString  };