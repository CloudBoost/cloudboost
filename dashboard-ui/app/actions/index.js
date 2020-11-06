/**
 * Created by Darkstar on 12/2/2016.
 */
/* eslint-disable no-undef
 */
import { xhrDashBoardClient, xhrAccountsClient, xhrCBClient } from '../xhrClient';
import { browserHistory } from 'react-router';
import { appSettings } from '../config';
import Axios from 'axios';

export function showAlert (type, text) {
  Messenger().post({
    message: text,
    type: type || 'error',
    showCloseButton: true
  });
}

const dispatchPaymentResponse = dispatch => response => {
  if (response.data) {
    dispatch({ type: 'UPDATE_PAYMENT', payload: response.data });
  }
  return response;
};

export function stripeCreateToken (data, callback) {
  return new Promise((resolve, reject) => {
    Stripe.createToken({
      name: data.name,
      number: data.number,
      exp_month: data.exp_month,
      exp_year: data.exp_year,
      cvc: data.cvv
    }, (status, response) => {
      if (callback) {
        callback(status, response);
      }
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}

export function testCard (requestObj) {
  return new Promise((resolve, reject) => {
    xhrDashBoardClient.post('test-card', requestObj)
      .then((response) => {
        return resolve(response);
      })
      .catch(err => {
        return reject(err.response);
      });
  });
}

export function removePaymentCard (data) {
  return function (dispatch) {
    return xhrDashBoardClient.post(`payment/card/${data.cardId}/remove`, data).then(dispatchPaymentResponse(dispatch));
  };
}

export function updatePaymentCard (data) {
  return function (dispatch) {
    return xhrDashBoardClient.put(`payment/card/${data.cardId}`, data).then(dispatchPaymentResponse(dispatch));
  };
}

export function createPaymentCard (data) {
  return function (dispatch) {
    return xhrDashBoardClient.post('payment/card', data).then(dispatchPaymentResponse(dispatch));
  };
}

export function fetchApps () {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING' });

    xhrDashBoardClient.get('app').then(response => {
      dispatch({ type: 'FETCH_APPS', payload: response.data });
      let appIdArray = response.data.map((app) => app.appId);
      dispatch(getAnalyticsData(appIdArray));
      dispatch({ type: 'STOP_LOADING' });
      dispatch(getBeacon());
      dispatch(getNotifications());
    }).catch(error => {
      dispatch({ type: 'STOP_LOADING' });
      console.log('inside fetch Apps error catch error: ');
      console.log(error);
    });
  };
}

export function fetchUser () {
  return function (dispatch) {
    xhrDashBoardClient.get('/user').then(response => {
      dispatch({ type: 'FETCH_USER', payload: response.data });
      dispatch(getNotifications());
      dispatch({ type: 'STOP_LOADING' });
    }).catch(error => {
      console.log('fetch user error');
      console.log(error);
    });
  };
}

export function getBeacon () {
  return function (dispatch) {
    xhrDashBoardClient.get('/beacon/get').then(response => {
      dispatch({ type: 'USER_BEACONS', payload: response.data ? response.data : {} });
    }).catch(error => {
      console.log('fetch beacons error');
      console.log(error);
    });
  };
}

export function updateBeacon (beacons, field) {
  return function (dispatch) {
    if (!beacons[field]) { beacons[field] = true; }
    xhrDashBoardClient.post('/beacon/update', beacons).then(response => {
      dispatch({ type: 'USER_BEACONS', payload: response.data });
    }).catch(error => {
      console.log('update beacons error');
      console.log(error);
    });
  };
}

export function saveUserImage (file) {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING' });
    let fd = new FormData();
    fd.append('file', file);
    xhrDashBoardClient.post('/file', fd).then((data) => {
      dispatch(fetchUser());
    }, (err) => {
      console.log(err);
    });
  };
}

export function deleteUserImage (fileId) {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING' });
    xhrDashBoardClient.delete('/file/' + fileId).then((data) => {
      dispatch(fetchUser());
    }, (err) => {
      console.log(err);
    });
  };
}

export function updateUser (name, oldPassword, newPassword) {
  let newData = {};
  newData.name = name;
  newData.oldPassword = oldPassword;
  newData.newPassword = newPassword;
  return xhrDashBoardClient.post('/user/update', newData, { timeout: 2000 });
}

export const addApp = (name, paymentData) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });

    return xhrDashBoardClient
      .post('/app/create', { 'name': name, paymentData: paymentData })
      .then(response => {
        if (!__isDevelopment) {
          /** **Tracking*********/
          mixpanel.track('Create App', { 'App id': response.data.appId, 'App Name': response.data.name });
          /** **End of Tracking*****/
        }

        dispatch({ type: 'ADD_APP', payload: response.data });
        dispatch({ type: 'STOP_LOADING_MODAL' });
        dispatch(fetchAppSettings(response.data.appId, response.data.keys.master));

        dispatch(changeState('cbapi'));
        browserHistory.push('#cbapi');

        return Promise.resolve();
      })
      .catch(error => {
        dispatch({ type: 'STOP_LOADING_MODAL' });
        showAlert('error', 'Something went wrong, try again later.');

        console.log('inside fetch Apps error catch error: ');
        console.log(error);

        return Promise.reject(error);
      });
  };
};

export const saveAppName = (appId, name) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING' });
    if (name) {
      xhrDashBoardClient.put('/app/' + appId, { 'name': name }).then(response => {
        dispatch(fetchApps());
      }).catch(error => {
        console.log('inside saveAppName error catch error: ');
        console.log(error);
        dispatch({ type: 'STOP_LOADING' });
        if (error.response.data === 'Unauthorized') {
          showAlert('error', 'You are not authorised to change this setting.');
        } else {
          showAlert('error', error.response.data);
        }
      });
    } else { dispatch(fetchApps()); }
  }
  ;
};

export const logOut = () => {
  return function (dispatch) {
    xhrAccountsClient.post('/user/logout').then(response => {
      dispatch({ type: 'LOGOUT' });
    }).catch(error => {
      console.log('inside Logout catch error: ');
      console.log(error);
    });
  };
};

export const getServerSettings = () => {
  return xhrDashBoardClient.get('/server');
};

export const upsertAPI_URL = (apiURL) => { // eslint-disable-line
  return function (dispatch) {
    xhrDashBoardClient.post('/server/url', { apiURL: apiURL }).then(response => {
    }).catch(error => {
      showAlert('error', 'URL Update Error');
      console.log('update url error : ');
      console.log(error);
    });
  };
};

export const fetchDevDetails = (IdArray) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    xhrAccountsClient
      .post('user/list', { IdArray: IdArray })
      .then(response => {
        dispatch({ type: 'RECEIVE_USERS', payload: response.data });
        dispatch({ type: 'STOP_LOADING_MODAL' });
      })
      .catch(error => {
        console.log('inside fetchDevDetails catch error: ');
        console.log(error);
        dispatch({ type: 'STOP_LOADING_MODAL' });
      });
  };
};

export const getUsersBySkipLimit = (skip, limit, skipUserIds) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING' });
    dispatch({ type: 'RESET_USER_LIST' });
    xhrDashBoardClient.put('/user/list/' + skip + '/' + limit, { skipUserIds: skipUserIds }).then(response => {
      dispatch({ type: 'RECEIVE_USERS', payload: response.data });
      dispatch({ type: 'STOP_LOADING' });
    }).catch(error => {
      console.log('inside getusers catch error: ');
      console.log(error);
      dispatch({ type: 'STOP_LOADING' });
    });
  };
};

export const updateUserActive = (userId, isActive) => {
  return function (dispatch) {
    xhrDashBoardClient.get('/user/active/' + userId + '/' + isActive).then(response => {
      dispatch(getUsersBySkipLimit(0, 20, []));
    }).catch(error => {
      showAlert('error', 'Error Updating User');
      console.log('update user error : ');
      console.log(error);
    });
  };
};

export const updateUserRole = (userId, isAdmin) => {
  return function (dispatch) {
    xhrDashBoardClient.get('/user/changerole/' + userId + '/' + isAdmin).then(response => {
      dispatch(getUsersBySkipLimit(0, 20, []));
    }).catch(error => {
      showAlert('error', 'Error Updating User');
      console.log('update user error : ');
      console.log(error);
    });
  };
};

export const deleteUser = (userId) => {
  return function (dispatch) {
    xhrDashBoardClient.delete('/user/' + userId).then(response => {
      dispatch(getUsersBySkipLimit(0, 20, []));
    }).catch(error => {
      showAlert('error', 'Error Deleting User');
      console.log('delete user error : ');
      console.log(error);
    });
  };
};

export const addUser = (name, email, password, isAdmin) => {
  return function (dispatch) {
    xhrDashBoardClient.post('/user/signup', {
      name: name,
      email: email,
      password: password,
      isAdmin: isAdmin
    }).then(response => {
      const data = response.data;
      if (!__isDevelopment) {
        /** **Tracking*********/
        mixpanel.alias(data._id);

        mixpanel.people.set({ 'Name': data.name, '$email': data.email });
        // mixpanel.identify(data._id);

        mixpanel.register({ 'Name': data.name, 'Email': data.email });
        mixpanel.track('AdminUserSignup', { 'Name': data.name, 'Email': data.email });
        /** **End of Tracking*****/
      }
      dispatch(getUsersBySkipLimit(0, 20, []));
    }).catch(error => {
      showAlert('error', 'Error Adding User');
      console.log('add user error : ');
      console.log(error);
    });
  };
};

export const sendInvitation = (appId, email) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });

    xhrDashBoardClient.post('/app/' + appId + '/invite', { 'email': email }).then(response => {
      dispatch({
        type: 'SAVE_INVITE',
        payload: {
          appId: appId,
          email: email
        }
      });
      dispatch({ type: 'STOP_LOADING_MODAL' });
    }).catch(error => {
      console.log('inside sendInvite error catch error: ');
      console.log(error);
      dispatch({ type: 'STOP_LOADING_MODAL' });
      dispatch({ type: 'STOP_LOADING' });
    });
  };
};

export const deleteDev = (appId, userId) => {
  return function (dispatch) {
    xhrDashBoardClient.delete('/app/' + appId + '/removedeveloper/' + userId).then(response => {
      dispatch({
        type: 'DELETE_DEV',
        payload: {
          appId: appId,
          developers: response.data.developers
        }
      });
    }).catch(error => {
      console.log('inside delete dev error catch error: ');
      console.log(error);
    });
  };
};

export const exitApp = (appId, userId) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    xhrDashBoardClient.delete('/app/' + appId + '/removedeveloper/' + userId).then(response => {
      dispatch(fetchApps());
    }).catch(error => {
      showAlert('error', 'Error while removing from app.');
      dispatch({ type: 'STOP_LOADING_MODAL' });
      console.log('inside delete dev error catch error: ');
      console.log(error);
    });
  };
};

export const addDeveloper = (appId, email) => {
  return function (dispatch) {
    xhrDashBoardClient.get('/app/' + appId + '/adddeveloper/' + email).then(response => {
      dispatch(fetchApps());
      dispatch(getNotifications());
    }).catch(error => {
      console.log('add dev error : ');
      console.log(error);
    });
  };
};

export const changeDeveloperRole = (appId, userId, role) => {
  return function (dispatch) {
    xhrDashBoardClient.get('/app/' + appId + '/changerole/' + userId + '/' + role).then(response => {
      // no need to fetchApps here
    }).catch(error => {
      showAlert('error', 'Error Updating Developer role.');
      console.log('change role error : ');
      console.log(error);
    });
  };
};

export const deleteInvite = (appId, email) => {
  return function (dispatch) {
    xhrDashBoardClient.post('/app/' + appId + '/removeinvitee', { email: email }).then(response => {
      dispatch({
        type: 'DELETE_INVITE',
        payload: {
          appId: appId,
          invited: response.data.invited
        }
      });
      dispatch(getNotifications());
    }).catch(error => {
      console.log('inside delete invite error catch error: ');
      console.log(error);
    });
  };
};

export const genMasterKey = (appId) => {
  return function (dispatch) {
    xhrDashBoardClient.get('/app/' + appId + '/change/masterkey').then(response => {
      dispatch({
        type: 'GEN_MASTER',
        payload: {
          appId: appId,
          masterKey: response.data
        }
      });
    }).catch(error => {
      console.log('inside genMasterKey action error catch error: ');
      console.log(error);
    });
  };
};

export const genClientKey = (appId) => {
  return function (dispatch) {
    xhrDashBoardClient.get('/app/' + appId + '/change/clientkey').then(response => {
      dispatch({
        type: 'GEN_CLIENT',
        payload: {
          appId: appId,
          clientKey: response.data
        }
      });
    }).catch(error => {
      console.log('inside genClientKey action error catch error: ');
      console.log(error);
    });
  };
};

export const deleteApp = (appId) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    xhrDashBoardClient.delete('/app/' + appId).then(response => {
      if (!__isDevelopment) {
        /** **Tracking*********/
        mixpanel.track('Delete App', { 'App id': appId });
        /** **End of Tracking*****/
      }
      dispatch({
        type: 'DELETE_APP',
        payload: {
          appId: appId
        }
      });
      dispatch({ type: 'STOP_LOADING_MODAL' });
    }).catch(error => {
      console.log('inside delete app error catch error: ');
      console.log(error);
      dispatch({ type: 'STOP_LOADING_MODAL' });
    });
  };
};

export const cancelPlan = (appId, cancelOption) => (dispatch) => {
  dispatch({ type: 'START_LOADING_MODAL' });
  return xhrDashBoardClient.post('/' + appId + '/cancel-plan', { disabledReason: 'cancelledPlan', cancelOption }).then(response => {
    if (!__isDevelopment) {
      /** **Tracking*********/
      mixpanel.track('Cancel Plan', { 'App id': appId });
      /** **End of Tracking*****/
    }
    if (cancelOption === 'cancelImmediately') {
      dispatch({
        type: 'DISABLE_APP',
        payload: {
          appId: appId
        }
      });
      showAlert('success', 'App plan is cancelled successfully');
    } else {
      showAlert('success', 'App plan will be cancelled after period end');
    }
    dispatch({ type: 'STOP_LOADING_MODAL' });
  }).catch(() => {
    showAlert('error', 'Something went wrong, try again later.');
    dispatch({ type: 'STOP_LOADING_MODAL' });
  });
};

export const manageApp = (appId, masterKey, jsKey, name, from) => {
  return function (dispatch) {
    // init CloudApp for current application
    CB.CloudApp.init(window.SERVER_URL, appId, masterKey);
    dispatch({
      type: 'MANAGE_APP',
      payload: {
        appId: appId,
        masterKey: masterKey,
        jsKey: jsKey,
        name: name
      }
    });
    markAppActive(appId);
    if (from === '/') { browserHistory.push('/' + appId + '/settings'); }
  };
};

export const createSale = (appId, cardDetails, planId) => {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    let reqObj = {
      cardDetails: cardDetails,
      planId: planId
    };
    xhrDashBoardClient.post('/' + appId + '/sale', reqObj).then(response => {
      dispatch({ type: 'STOP_LOADING_MODAL' });
    }).catch(error => {
      dispatch({ type: 'STOP_LOADING_MODAL' });
      console.log('inside createSale error catch error: ');
      console.log(error);
    });
  };
};

export function getAnalyticsData (appIdArray) {
  return function (dispatch) {
    xhrDashBoardClient.post('/analytics/api-storage/bulk/count', { appIdArray: appIdArray }).then(response => {
      dispatch({ type: 'RECEIVE_ANALYTICS', payload: response.data });
    });
  };
}

export function getNotifications () {
  return function (dispatch) {
    xhrDashBoardClient.get('/notification/0/10').then(response => {
      dispatch({ type: 'FETCH_NOTIFICATIONS', payload: response.data });
    }).catch(error => {
      console.log(error);
    });
  };
}

export function updateNotificationsSeen () {
  return function (dispatch) {
    xhrDashBoardClient.get('/notification/seen').then(response => {
      dispatch(getNotifications());
    }).catch(error => {
      console.log(error);
    });
  };
}

export function deleteNotificationById (id) {
  return function (dispatch) {
    xhrDashBoardClient.delete('/notification/' + id).then(response => {
      dispatch(getNotifications());
    }).catch(error => {
      console.log(error);
    });
  };
}

export function markAppActive (appId) {
  xhrDashBoardClient.post('/app/active/' + appId, {}).then(response => {
  }).catch(error => {
    console.log('mark active error', error);
  });
}

export function getCards () {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    xhrDashBoardClient.get('/cards').then(response => {
      dispatch({ type: 'FETCH_CARDS', payload: response.data });
      dispatch({ type: 'STOP_LOADING_MODAL' });
    }).catch(error => {
      dispatch({ type: 'STOP_LOADING_MODAL' });
      console.log('get cards error', error);
    });
  };
}

export function addCard (name, number, expMonth, expYear) {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    let postObject = {};
    postObject.name = name;
    postObject.number = number;
    postObject.expMonth = expMonth;
    postObject.expYear = expYear;

    xhrDashBoardClient.post('/card', postObject).then(response => {
      dispatch(getCards());
    }, () => {
      showAlert('error', 'Error Adding card.');
      dispatch({ type: 'STOP_LOADING_MODAL' });
    });
  };
}

// table actions
export function fetchTables (appId, masterKey) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });
    xhrCBClient.post('/app/' + appId + '/_getAll', { key: masterKey }).then(response => {
      if (response.data) {
        dispatch({
          type: 'FETCH_TABLES',
          payload: {
            appId: appId,
            tables: response.data
          }
        });
      }
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    }).catch(error => {
      console.log('inside fetch Tables error catch error: ');
      console.log(error);
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    });
  };
}

export function createTable (appId, masterKey, tableName) {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    return xhrCBClient.put('/app/' + appId + '/' + tableName, {
      key: masterKey,
      'data': {
        'name': tableName,
        'appId': appId,
        '_type': 'table',
        'type': 'custom',
        'maxCount': 9999,
        'columns': [
          {
            'name': 'id',
            '_type': 'column',
            'dataType': 'Id',
            'required': true,
            'unique': true,
            'relatedTo': null,
            'relationType': null,
            'isDeletable': false,
            'isEditable': false,
            'isRenamable': false,
            'editableByMasterKey': false
          }, {
            'name': 'expires',
            '_type': 'column',
            'dataType': 'DateTime',
            'required': false,
            'unique': false,
            'relatedTo': null,
            'relationType': null,
            'isDeletable': false,
            'isEditable': false,
            'isRenamable': false,
            'editableByMasterKey': false
          }, {
            'name': 'updatedAt',
            '_type': 'column',
            'dataType': 'DateTime',
            'required': true,
            'unique': false,
            'relatedTo': null,
            'relationType': null,
            'isDeletable': false,
            'isEditable': false,
            'isRenamable': false,
            'editableByMasterKey': false
          }, {
            'name': 'createdAt',
            '_type': 'column',
            'dataType': 'DateTime',
            'required': true,
            'unique': false,
            'relatedTo': null,
            'relationType': null,
            'isDeletable': false,
            'isEditable': false,
            'isRenamable': false,
            'editableByMasterKey': false
          }, {
            'name': 'ACL',
            '_type': 'column',
            'dataType': 'ACL',
            'required': true,
            'unique': false,
            'relatedTo': null,
            'relationType': null,
            'isDeletable': false,
            'isEditable': false,
            'isRenamable': false,
            'editableByMasterKey': false
          }
        ]
      }
    }).then(response => {
      if (response.data) {
        if (!__isDevelopment) {
          /** **Tracking*********/
          mixpanel.track('Create Table', { 'Table name': tableName, 'appId': appId });
          /** **End of Tracking*****/
        }
        dispatch({
          type: 'ADD_TABLE',
          payload: {
            appId: appId,
            newTable: response.data
          }
        });
      }
      dispatch({ type: 'STOP_LOADING_MODAL' });
      return Promise.resolve();
    }).catch(error => {
      console.log('inside add table error catch error: ');
      dispatch({ type: 'STOP_LOADING_MODAL' });
      return Promise.reject(error);
    });
  };
}

export function deleteTable (appId, masterKey, tableName) {
  console.log('inside delete table action creator');
  return function (dispatch) {
    return xhrCBClient.put('/app/' + appId + '/' + tableName, {
      key: masterKey,
      method: 'DELETE',
      name: tableName
    }).then(response => {
      if (response.data) {
        if (!__isDevelopment) {
          /** **Tracking*********/
          mixpanel.track('Delete Table', { 'Table name': tableName, 'appId': appId });
          /** **End of Tracking*****/
        }
        dispatch({
          type: 'DELETE_TABLE',
          payload: {
            appId: appId,
            name: tableName
          }
        });
      }
      return Promise.resolve();
    }).catch(error => {
      console.log('inside delete table error catch error: ');
      console.log(error);
      return Promise.reject(error);
    });
  };
}

export const setTableSearchFilter = (filter) => {
  return function (dispatch) {
    dispatch({ type: 'SET_TABLE_FILTER', payload: filter });
  };
};

// cache actions
export function fetchCache () {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    CB.CloudCache.getAll().then((data) => {
      dispatch({ type: 'FETCH_CACHE', payload: data });
      dispatch({ type: 'STOP_LOADING_MODAL' });
    }, (err) => {
      console.log('cache fetch error ', err);
      dispatch({ type: 'STOP_LOADING_MODAL' });
    });
  };
}

export function createCache (cacheName) {
  if (!__isDevelopment) {
    /** **Tracking*********/
    mixpanel.track('Create Cache', { 'App id': CB.appId, 'Cache Name': cacheName });
    /** **End of Tracking*****/
  }
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    let cache = new CB.CloudCache(cacheName);
    cache.create().then(() => {
      dispatch(fetchCache());
    }, (err) => {
      console.log('cache add error ', err);
    });
  };
}

export function deleteCache (selectedCache) {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    selectedCache.delete().then((items) => {
      dispatch({ type: 'STOP_LOADING_MODAL' });
      dispatch(fetchCache());
    }, (err) => {
      dispatch({ type: 'STOP_LOADING_MODAL' });
      console.log('cache delete error ', err);
    });
  };
}

export function clearCache (selectedCache) {
  return function (dispatch) {
    selectedCache.clear().then((items) => {
      dispatch(fetchCache());
    }, (err) => {
      console.log('cache delete error ', err);
    });
  };
}

export function addItemToCache (selectedCache, item, value) {
  return function (dispatch) {
    selectedCache.set(item, value).then(() => {
      dispatch(fetchCache());
    }, (err) => {
      console.log('add item to cahce error ', err);
    });
  };
}

export function deleteItemFromCache (selectedCache, item) {
  return function (dispatch) {
    selectedCache.deleteItem(item).then(() => {
      dispatch(fetchCache());
    }, (err) => {
      console.log('delete item from cache error ', err);
    });
  };
}

export function resetCacheState () {
  return function (dispatch) {
    dispatch({ type: 'RESET' });
  };
}

// queue actions
export function fetchQueue () {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    CB.CloudQueue.getAll({
      success: function (list) {
        dispatch({
          type: 'FETCH_QUEUE',
          payload: list || []
        });
        dispatch({ type: 'STOP_LOADING_MODAL' });
        return Promise.resolve();
      },
      error: function (error) {
        console.log('queue fetch error ', error);
        dispatch({ type: 'STOP_LOADING_MODAL' });
        return Promise.reject(error);
      }
    });
  };
}

export function createQueue (queueName) {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    let queue = new CB.CloudQueue(queueName);
    queue.create({
      success: function (queueObject) {
        if (!__isDevelopment) {
          /** **Tracking*********/
          mixpanel.track('Create Queue', { 'App id': CB.appId, 'Queue Name': queueName });

          /** **End of Tracking*****/
        }
        dispatch(fetchQueue());
      },
      error: function (error) {
        console.log('queue add error ', error);
      }
    });
  };
}

export function selectQueue (selectedQueue) {
  return function (dispatch) {
    selectedQueue.getAllMessages({
      success: function (messagesList) {
        dispatch({
          type: 'SELECT_QUEUE',
          payload: {
            selectedQueue: selectedQueue,
            items: messagesList
          }
        });
      },
      error: function (error) {
        console.log('Queue select error ', error);
      }
    });
  };
}

export function deleteQueue (selectedQueue) {
  return function (dispatch) {
    dispatch({ type: 'START_LOADING_MODAL' });
    selectedQueue.delete({
      success: function () {
        dispatch({ type: 'STOP_LOADING_MODAL' });
        dispatch(fetchQueue());
      },
      error: function (error) {
        dispatch({ type: 'STOP_LOADING_MODAL' });
        console.log('queue delete error ', error);
      }
    });
  };
}

export function updateQueue (selectedQueue) {
  return function (dispatch) {
    selectedQueue.update({
      success: function () {
        dispatch(fetchQueue());
      },
      error: function (error) {
        console.log('queue update error ', error);
      }
    });
  };
}

export function addItemToQueue (selectedQueue, message, timeout, delay, expires) {
  return function (dispatch) {
    let queueMessage = new CB.QueueMessage();
    queueMessage.message = message;
    if (timeout > 0) {
      queueMessage.timeout = timeout;
    }
    if (delay > 0) {
      queueMessage.delay = delay;
    }
    if (expires) {
      queueMessage.expires = expires;
    }
    selectedQueue.addMessage(queueMessage, {
      success: function (queueMessage) {
        dispatch(fetchQueue());
      },
      error: function (error) {
        console.log('add item to queue error ', error);
      }
    });
  };
}

export function deleteItemFromQueue (selectedQueue, itemId) {
  return function (dispatch) {
    selectedQueue.deleteMessage(itemId, {
      success: function () {
        dispatch(fetchQueue());
      },
      error: function (error) {
        console.log('delete item from queue error ', error);
      }
    });
  };
}

export function updateQueueMessage (selectedQueue, selectedMessage) {
  return function (dispatch) {
    selectedQueue.updateMessage(selectedMessage, {
      success: function () {
        dispatch(fetchQueue());
      },
      error: function (error) {
        console.log('message update error', error);
      }
    });
  };
}

export function resetQueueState () {
  return function (dispatch) {
    dispatch({ type: 'RESET' });
  };
}

// campaign actions
export function sendEmailCampaign (appId, masterKey, emailSubject, emailBody) {
  let postObject = {
    key: masterKey,
    emailBody: emailBody,
    emailSubject: emailSubject
  };
  return xhrCBClient.post('/email/' + appId + '/campaign', postObject);
}

export function sendPushCampaign (messageObject, query) {
  if (query) {
    return CB.CloudPush.send(messageObject, query);
  } else { return CB.CloudPush.send(messageObject); }
}

// analytics
export function fetchAnalyticsAPI (appId) {
  return function (dispatch) {
    xhrDashBoardClient.get('/analytics/api/' + appId + '/usage').then(response => {
      dispatch({ type: 'ANALYTICS_API', payload: response.data });
    }, () => {
      showAlert('error', 'Error fetching API analytics data.');
    });
  };
}

export function fetchAnalyticsStorage (appId) {
  return function (dispatch) {
    xhrDashBoardClient.get('/analytics/storage/' + appId + '/usage').then(response => {
      dispatch({ type: 'ANALYTICS_STORAGE', payload: response.data });
    }, () => {
      showAlert('error', 'Error fetching Storage analytics data.');
    });
  };
}

export function resetAnalytics () {
  return function (dispatch) {
    dispatch({ type: 'RESET' });
  };
}

// app settings
export function fetchAppSettings (appId, masterKey, from) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });

    let postObject = {};
    postObject.key = masterKey;

    return xhrCBClient
      .post('/settings/' + appId, postObject)
      .then(response => {
        if (response.data.length === 0) {
          let putAllSettings = [
            xhrCBClient.put('/settings/' + appId + '/general', {
              key: masterKey,
              settings: appSettings.generalSettings.settings
            }),
            xhrCBClient.put('/settings/' + appId + '/email', {
              key: masterKey,
              settings: appSettings.emailSettings.settings
            }),
            xhrCBClient.put('/settings/' + appId + '/push', {
              key: masterKey,
              settings: appSettings.pushSettings.settings
            }),
            xhrCBClient.put('/settings/' + appId + '/auth', {
              key: masterKey,
              settings: appSettings.authSettings.settings
            }),
            xhrCBClient.put('/settings/' + appId + '/integrations', {
              key: masterKey,
              settings: appSettings.integrationSettings.settings
            })
          ];

          Promise
            .all(putAllSettings)
            .then((res) => {
              dispatch(fetchAppSettings(appId, masterKey));
            })
            .catch(() => {
              showAlert('error', 'Error fetching App settings.');
              dispatch({ type: 'STOP_SECONDARY_LOADING' });
            });
        } else {
          dispatch({ type: 'FETCH_APP_SETTINGS', payload: response.data });
          dispatch({ type: 'STOP_SECONDARY_LOADING' });
          return Promise.resolve();
        }
      })
      .catch(err => {
        showAlert('error', 'Error fetching App settings.');
        return Promise.reject(err);
      });
  };
}

export function updateSettings (appId, masterKey, categoryName, settingsObject) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });
    let postObject = {};
    postObject.key = masterKey;
    postObject.settings = settingsObject;

    xhrCBClient.put('/settings/' + appId + '/' + categoryName, postObject).then(response => {
      if (!__isDevelopment) {
        /** **Tracking*********/
        mixpanel.track('Save ' + categoryName.charAt(0).toUpperCase() + categoryName.slice(1) + ' Settings', { 'appId': CB.appId });
        /** **End of Tracking*****/
      }
      dispatch(fetchAppSettings(appId, masterKey));
    }, () => {
      showAlert('error', 'Error Updating App settings.');
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    });
  };
}

export function upsertAppSettingsFile (appId, masterKey, fileObj, category, settingsObject) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });
    let postObject = new FormData();
    postObject.append('file', fileObj);
    postObject.append('key', masterKey);

    xhrCBClient.put('/settings/' + appId + '/file/' + category, postObject).then(response => {
      if (category === 'general') {
        settingsObject.appIcon = response.data;
      }
      if (category === 'push') {
        if (settingsObject.apple.certificates.length) { settingsObject.apple.certificates[0] = response.data; } else { settingsObject.apple.certificates.push(response.data); }
      }
      dispatch(updateSettings(appId, masterKey, category, settingsObject));
    }, () => {
      showAlert('error', 'Error Updating File.');
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    });
  };
}

export function exportDatabase (appId, masterKey) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });
    let postObject = new FormData();
    postObject.append('key', masterKey);

    xhrCBClient.post('/backup/' + appId + '/exportdb', postObject).then(response => {
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
      let blob = new Blob([JSON.stringify(response.data)], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, 'dump.json');
    }, () => {
      showAlert('error', 'Error Exporting Database.');
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    });
  };
}

export function importDatabase (appId, masterKey, fileObj) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });
    let postObject = new FormData();
    postObject.append('key', masterKey);
    postObject.append('file', fileObj);

    xhrCBClient.post('/backup/' + appId + '/importdb', postObject).then(response => {
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    }, () => {
      showAlert('error', 'Error Importing Database.');
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    });
  };
}

export function getAccessURL (appId) {
  return xhrDashBoardClient.post('/dbaccess/get/' + appId, {});
}

export function enableMongoAccess (appId) {
  return xhrDashBoardClient.post('/dbaccess/enable/' + appId, {});
}

export function getDefaultTemplate (templateName) {
  return Axios.get('public/' + templateName + '.html');
}

export function resetAppSettings () {
  return function (dispatch) {
    dispatch({ type: 'RESET_APP_SETTINGS' });
  };
}

export function changeState (where, openDrawer = false) {
  return function (dispatch) {
    dispatch({ type: 'TOGGLE_DRAWER', payload: { openDrawer: false } });
    if (where === 'cbapi') {
      dispatch({
        type: 'MiGRATE_AND_TOGGLE',
        payload: { openDrawer: true, migrateTo: where }
      });
    } else {
      if (openDrawer === true) {
        dispatch({
          type: 'MiGRATE_AND_TOGGLE',
          payload: { openDrawer: true, migrateTo: where }
        });
      } else {
        dispatch({ type: 'MiGRATE_AND_TOGGLE', payload: { migrateTo: where } })
        ;
      }
    }
  };
}

export function toggleDrawer (toggle) {
  return function (dispatch) {
    dispatch({ type: 'TOGGLE_DRAWER', payload: { openDrawer: toggle } });
  };
}

export function fetchToken (appId, masterKey, categoryName, settingsObject, code, clientSecret, clientId) {
  return function (dispatch) {
    var url = 'https://slack.com/api/oauth.access?code=' + code + '&client_secret=' + clientSecret + '&client_id=' + clientId + '&redirect_uri=' + global.DASHBOARD_URL + '/' + appId + '/settings';
    Axios.get(url)
      .then((response) => {
        return response;
      })
      .then((data) => {
        settingsObject.slack.enabled = true;
        if (data.data.incoming_webhook) { settingsObject.slack.webhook_url = data.data.incoming_webhook.url; }
        settingsObject.slack.oauth_response = data;
        dispatch(updateSettings(appId, masterKey, categoryName, settingsObject));
      })
      .catch(() => dispatch());
  };
}

export function fetchChannels (url, accessToken) {
  return function (dispatch) {
    Axios.get(url + '?token=' + accessToken)
      .then((response) => {
        return response;
      })
      .then((data) => {
        var actionObject = { type: 'CHANNELS_LIST', payload: data.data };
        return dispatch(actionObject);
      })
      .catch(() => dispatch());
  };
}

export function fetchEvents (tableName, column) {
  return function (dispatch) {
    let query = new CB.CloudQuery(tableName);
    query.distinct(column, {
      success: function (list) {
        dispatch({ type: 'EVENTS', data: list });
      }
    });
  };
}

// table actions
export function fetchInvoices (appId, masterKey) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });
    xhrDashBoardClient.get('/app/' + appId + '/invoices', { key: masterKey }).then(response => {
      if (response.data) {
        dispatch({
          type: 'FETCH_INVOICES',
          payload: {
            appId: appId,
            invoices: response.data.invoices
          }
        });
      }
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    }).catch(() => {
      dispatch({ type: 'STOP_SECONDARY_LOADING' });
    });
  };
}

// table actions
export function exportInvoice (invoiceId, invoiceNumber) {
  return function (dispatch) {
    dispatch({ type: 'START_SECONDARY_LOADING' });
    xhrDashBoardClient({
      url: '/invoices/' + invoiceId + '/pdf',
      method: 'GET',
      responseType: 'blob'
    })
      .then(response => {
        if (response.data) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${invoiceNumber}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        dispatch({ type: 'STOP_SECONDARY_LOADING' });
      }).catch(() => {
        dispatch({ type: 'STOP_SECONDARY_LOADING' });
      });
  };
}
