import beacons from '../../app/reducers/beacons';

describe('beacons reducers', () => {
  it('should return the initial state', () => {
    expect(beacons(undefined, {})).to.deep.equal([]);
  });

  it('should handle USER_BEACONS', () => {
    expect(beacons(undefined, {
      type: 'USER_BEACONS',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
        a: 'a',
        b: 'b'
    });
  });

});