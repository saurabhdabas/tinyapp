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
module.exports = { getUserByEmail };