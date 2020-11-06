import cache from '../../app/reducers/cache';

describe('cache reducers', () => {
  it('should return the initial state', () => {
    expect(cache(undefined, {})).to.deep.equal({
      allCaches: [], 
      selectedCache: {}, 
      selectedCacheItems: [], 
      loaded: false
    });
  });

  it('should handle FETCH_CACHE', () => {
    expect(cache(undefined, {
      type: 'FETCH_CACHE',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
      allCaches: [{
        a: 'a',
        b: 'b'
      }], 
      selectedCache: {}, 
      selectedCacheItems: [], 
      loaded: true
    });
  });

  it('should handle SELECT_CACHE', () => {
    expect(cache(undefined, {
      type: 'SELECT_CACHE',
      payload: {
        items: {
          a: 'a',
          b: 'b'
        },
        selectedCache: {
          c: 'c',
          d: 'd'
        }
      }
    })).to.deep.equal({
      allCaches: [], 
      selectedCache: {
        c: 'c',
        d: 'd'
      }, 
      selectedCacheItems: [{
        a: 'a',
        b: 'b'
      }], 
      loaded: false
    });
  });

  it('should handle RESET', () => {
    expect(cache(undefined, {
      type: 'RESET'
    })).to.deep.equal({
      allCaches: [], 
      selectedCache: {}, 
      selectedCacheItems: [], 
      loaded: false
    });
  });
});