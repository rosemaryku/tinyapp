// HELPER FUNCTIONS //

// Generate random alphanumeric string with 6 characters
const generateRandomString = () => {
  return (Math.random() + 1).toString(36).substring(6);
};

// Checks if user is already in database
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) return user;
  }
  return false;
};

// Returns urls for specific user
const urlsForUser = (urlDatabase, userID) => {
  let urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };
