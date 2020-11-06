import queue from '../../app/reducers/queue';

describe('queue reducers', () => {
  it('should return the initial state', () => {
    expect(queue(undefined, {})).to.deep.equal({
      allQueues: [], 
      selectedQueue: {}, 
      selectedQueueItems: [], 
      loaded:false
    });
  });

  it('should handle FETCH_QUEUE', () => {
    expect(queue(undefined, {
      type: 'FETCH_QUEUE',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
      allQueues: [{
        a: 'a',
        b: 'b'
      }], 
      selectedQueue: {}, 
      selectedQueueItems: [], 
      loaded:true
    });
  });

  it('should handle SELECT_QUEUE', () => {
    expect(queue(undefined, {
      type: 'SELECT_QUEUE',
      payload: {
        items: {
          a: 'a',
          b: 'b'
        },
        selectedQueue: {
          a: 'a',
          b: 'b'
        }
      }
    })).to.deep.equal({
      allQueues: [], 
      selectedQueue: {
        a: 'a',
        b: 'b'
      }, 
      selectedQueueItems: [{
        a: 'a',
        b: 'b'
      }], 
      loaded:false
    });
  });

  it('should handle RESET', () => {
    expect(queue(undefined, {
      type: 'RESET'
    })).to.deep.equal({
      allQueues: [], 
      selectedQueue: {}, 
      selectedQueueItems: [], 
      loaded:false
    });
  });
  
});