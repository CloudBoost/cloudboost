import user from '../../app/reducers/user';

describe('user reducers', () => {
  it('should return the initial state', () => {
    expect(user(undefined, {})).to.deep.equal({
      isLogggedIn: false, 
      user: {}, 
      notifications: []
    });
  });

  it('should handle LOGOUT', () => {
    expect(user(undefined, {
      type: 'LOGOUT'
    })).to.deep.equal({
      isLogggedIn: false,
      user: {}
    });
  });

  it('should handle FETCH_USER', () => {
    expect(user(undefined, {
      type: 'FETCH_USER',
      payload: {
        user: {
          a: 'a',
          b: 'b'
        }
      }
    })).to.deep.equal({
      isLogggedIn: true,
      user: {
        a: 'a',
        b: 'b'
      }
    });
  });

  it('should handle FETCH_NOTIFICATIONS', () => {
    expect(user(undefined, {
      type: 'FETCH_NOTIFICATIONS',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
      isLogggedIn: false,
      user: {},
      notifications: {
        a: 'a',
        b: 'b'
      }
    });
  });
  
});