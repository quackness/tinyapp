const { assert } = require('chai');
const { findUserByEmail } = require('../helpers');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe('getUserByEmail', () => {
  it('should return a user object with a valid email', () => {
    const user = findUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.equal(user.id, expectedUserID);
  });

  it('should return undefined if we pass an email that is not in our users database', () => {
    const user = findUserByEmail('non-existent@example.com', testUsers);
    assert.equal(user, undefined);
  });
});
