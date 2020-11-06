import loader from '../../app/reducers/loader';

describe('loader reducers', () => {
  it('should return the initial state', () => {
    expect(loader(undefined, {})).to.deep.equal({
      loading: true,
      modal_loading: false,
      secondary_loading: false
    });
  });

  it('should handle START_LOADING', () => {
    expect(loader(undefined, {
      type: 'START_LOADING'
    })).to.deep.equal({
      loading: true
    });
  });

  it('should handle START_SECONDARY_LOADING', () => {
    expect(loader(undefined, {
      type: 'START_SECONDARY_LOADING'
    })).to.deep.equal({
      secondary_loading: true
    });
  });

  it('should handle START_LOADING_MODAL', () => {
    expect(loader(undefined, {
      type: 'START_LOADING_MODAL'
    })).to.deep.equal({
      modal_loading: true
    });
  });

  it('should handle STOP_LOADING', () => {
    expect(loader(undefined, {
      type: 'STOP_LOADING'
    })).to.deep.equal({
      loading: false
    });
  });

  it('should handle STOP_SECONDARY_LOADING', () => {
    expect(loader(undefined, {
      type: 'STOP_SECONDARY_LOADING'
    })).to.deep.equal({
      secondary_loading: false
    });
  });

  it('should handle STOP_LOADING_MODAL', () => {
    expect(loader(undefined, {
      type: 'STOP_LOADING_MODAL'
    })).to.deep.equal({
      modal_loading: false
    });
  });

});