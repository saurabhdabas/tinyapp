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

module.exports = { urlDatabase, users };