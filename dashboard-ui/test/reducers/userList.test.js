import userList from '../../app/reducers/userList';

describe('userList reducers', () => {
  it('should return the initial state', () => {
    expect(userList(undefined, {})).to.deep.equal({});
  });

  it('should handle RECEIVE_USERS', () => {
    expect(userList(undefined, {
      type: 'RECEIVE_USERS',
      payload: [{
        _id: 'a123',
        a: 'a',
        b: 'b'
      }]
    })).to.deep.equal({
      'a123': {
        _id: 'a123',
        a: 'a',
        b: 'b'
      }
    });
  });

  it('should handle RESET_USER_LIST', () => {
    expect(userList(undefined, {
      type: 'RESET_USER_LIST'
    })).to.deep.equal({});
  });
  
});