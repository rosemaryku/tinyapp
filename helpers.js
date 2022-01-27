// HELPER FUNCTIONS //

// Checks if user is already in database
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) return user;
  }
  return false;
};

// Checks login credentials
// const findUser = (database, email, password) => {
//   for (let user in database) {
//     if (database[user].email === email) {
//       if (database[user].password === password) {
//         return user;
//       } else console.log("Invalid password");
//     } else console.log("Invalid email");
//   }
//   return null;
// };

module.exports = { getUserByEmail };
