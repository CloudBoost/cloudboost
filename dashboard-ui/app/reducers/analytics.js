/**
 * Created by Darkstar on 1/12/2017.
 */

const defaultState = {
  bulkAnalytics: {},
  analyticsApi: {
    totalApiCount: 0,
    usage: []
  },
  analyticsStorage: {
    totalStorage: 0,
    usage: []
  }
};

export default function (state = defaultState, action) {
  switch (action.type) {
    case 'RECEIVE_ANALYTICS' : {
      state.bulkAnalytics = action.payload;
      return Object.assign({}, state);
    }
    case 'ANALYTICS_API' : {
      if (action.payload) {
        state.analyticsApi = action.payload;
      }
      return Object.assign({}, state);
    }
    case 'ANALYTICS_STORAGE' : {
      if (action.payload) {
        state.analyticsStorage = action.payload;
      }
      return Object.assign({}, state);
    }
    case 'RESET' : {
      state.analyticsStorage = defaultState.analyticsStorage;
      state.analyticsApi = defaultState.analyticsApi;
      return Object.assign({}, state);
    }
    default:
      return state;
  }
}
