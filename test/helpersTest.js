const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
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
};


//should return a user with a valid email
describe('getUserByEmail', function() {
  it('should return a user with a valid email', function() {
  const user = findUserByEmail('user@example.com', testUsers);
  const expectedUserID = 'userRandomID';
  assert.equal(user, expectedUserID);
});

//should return undefined if we pass an email that is not in our users database

it('should return undefined if we pass an email that is not in our users database', function() {
  const user = findUserByEmail('nonExistantUser@example.com', testUsers);
  assert.equal(user, undefined);
});
});



