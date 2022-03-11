const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW'
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW'
  }
};

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    const randomNum = Math.floor(Math.random() * characters.length);
    result += characters[randomNum];
  }
  return result;
};

const urlsForUser = (id) => {
  let newObj = {};
  for (let short in urlDatabase){
    const userID = urlDatabase[short].userID;
    if (id === userID) {
      newObj[short] = urlDatabase[short];
    }
  }
  return newObj;
};

function findUserByEmail(email, users) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

module.exports = {
  urlDatabase,
  generateRandomString,
  urlsForUser,
  findUserByEmail
};
