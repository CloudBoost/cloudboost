import manageApp from '../../app/reducers/manageApp';

describe('manageApp reducers', () => {
  it('should return the initial state', () => {
    expect(manageApp(undefined, {})).to.deep.equal({});
  });

  it('should handle MANAGE_APP', () => {
    expect(manageApp(undefined, {
      type: 'MANAGE_APP',
      payload: {
        appId: '124',
        masterKey: 'abcdefgh',
        name: 'XYZ'
      }
    })).to.deep.equal({
      viewActive: true,
      appId: '124',
      masterKey: 'abcdefgh',
      name: 'XYZ'
    });
  });

  it('should handle SET_TABLE_FILTER', () => {
    expect(manageApp(undefined, {
      type: 'SET_TABLE_FILTER',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
      tableFilter: {
        a: 'a',
        b: 'b'
      }
    });
  });

});