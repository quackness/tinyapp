function findUserByEmail(email, users) {//rafactored
  for (const id in users) {
    if (users[id].email === email) {
      //return users[id];
      return users[id].id;
    }
  }
  return null;
};

module.exports = {
  findUserByEmail
};