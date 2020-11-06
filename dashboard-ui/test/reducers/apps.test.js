import apps from '../../app/reducers/apps';

describe('apps reducers', () => {
  it('should return the initial state', () => {
    expect(apps(undefined, {})).to.deep.equal([]);
  });

  it('should handle FETCH_APPS', () => {
    expect(apps(undefined, {
      type: 'FETCH_APPS',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
        a: 'a',
        b: 'b'
    });
  });

  it('should handle LOGOUT', () => {
    expect(apps(undefined, {
      type: 'LOGOUT'
    })).to.deep.equal([]);
  });

  it('should handle ADD_APP', () => {
    expect(apps(undefined, {
      type: 'ADD_APP',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal([
      {
        a: 'a',
        b: 'b'
      }
    ]);
  });
  
});