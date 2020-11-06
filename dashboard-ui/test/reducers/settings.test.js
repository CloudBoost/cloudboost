import settings from '../../app/reducers/settings';

describe('settings reducers', () => {
  it('should return the initial state', () => {
    expect(settings(undefined, {})).to.deep.equal([]);
  });

  it('should handle FETCH_APP_SETTINGS', () => {
    expect(settings(undefined, {
      type: 'FETCH_APP_SETTINGS',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
        a: 'a',
        b: 'b'
    });
  });
  
  it('should handle RESET_APP_SETTINGS', () => {
    expect(settings(undefined, {
      type: 'RESET_APP_SETTINGS'
    })).to.deep.equal([]);
  });
});