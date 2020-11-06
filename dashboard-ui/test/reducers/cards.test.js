import cards from '../../app/reducers/cards';

describe('cards reducers', () => {
  it('should return the initial state', () => {
    expect(cards(undefined, {})).to.deep.equal([]);
  });

  it('should handle FETCH_CARDS', () => {
    expect(cards(undefined, {
      type: 'FETCH_CARDS',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
      a: 'a',
      b: 'b'
    });
  });

  it('should handle RESET', () => {
    expect(cards(undefined, {
      type: 'RESET'
    })).to.deep.equal([]);
  });
  
});