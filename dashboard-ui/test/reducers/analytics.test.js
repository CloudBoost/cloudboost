import analytics from '../../app/reducers/analytics';

describe('analytics reducers', () => {
  
  it('should return the initial state', () => {
    expect(analytics(undefined, {})).to.deep.equal({
      bulkAnalytics : {},
      analyticsApi : {
        totalApiCount:0,
        usage:[]
      },
      analyticsStorage : {
        totalStorage:0,
        usage:[]
      }
    });
  });

  it('should handle RECEIVE_ANALYTICS', () => {
    expect(analytics(undefined, {
      type: 'RECEIVE_ANALYTICS',
      payload: {
        a: 'a',
        b: 'b'
      }
    })).to.deep.equal({
      bulkAnalytics : {
        a: 'a',
        b: 'b'
      },
      analyticsApi : {
        totalApiCount:0,
        usage:[]
      },
      analyticsStorage : {
        totalStorage:0,
        usage:[]
      }
    });

  });

  it('should handle ANALYTICS_API', () => {
    expect(analytics(undefined, {
      type: 'ANALYTICS_API',
      payload: {
        totalApiCount:1,
        usage:['a']
      }
    })).to.deep.equal({
      bulkAnalytics : {
        a: 'a',
        b: 'b'
      },
      analyticsApi : {
        totalApiCount:1,
        usage:['a']
      },
      analyticsStorage : {
        totalStorage:0,
        usage:[]
      }
    });

  });

  it('should handle ANALYTICS_STORAGE', () => {
    expect(analytics(undefined, {
      type: 'ANALYTICS_STORAGE',
      payload: {
        totalApiCount:1,
        usage:['a']
      }
    })).to.deep.equal({
      bulkAnalytics : {
        a: 'a',
        b: 'b'
      },
      analyticsApi : {
        totalApiCount:1,
        usage:['a']
      },
      analyticsStorage : {
        totalApiCount:1,
        usage:['a']
      }
    });

  });
    
  it('should handle RESET', () => {
    expect(analytics(undefined, {
      type: 'RESET',
      
    })).to.deep.equal({
      bulkAnalytics : {
        a: 'a',
        b: 'b'
      },
      analyticsApi : {
        totalApiCount:1,
        usage:['a']
      },
      analyticsStorage : {
        totalApiCount:1,
        usage:['a']
      }
    });

  });

});