/*import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../../app/actions';
import nock from 'nock';
import {xhrDashBoardClient, xhrAccountsClient, xhrCBClient} from '../../app/xhrClient';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const accountsApi = 'https://localhost:3000';
const cloudBoostApi = 'https://localhost:4730';

describe('async actions', () => {

  afterEach(() => {
    nock.cleanAll();
  });

  it('fetches App', () => {
    nock(accountsApi)
      .get('/app')
      .reply(200, { payload: [{appId: 123}] });

    const expectedActions = [
      {type: 'START_LOADING'},
      {type: 'FETCH_APPS', payload: [{appId: 123}]},
      {type: 'RECEIVE_ANALYTICS', payload: [{id: 111}]},
      {type: 'STOP_LOADING'}
    ];
    const store = mockStore({ apps: [] });

    return store.dispatch(actions.fetchApps()).then(() => {
      // return of async actions
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});*/