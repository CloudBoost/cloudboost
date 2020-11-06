/**
 * Created by Darkstar on 12/2/2016.
 */

const app = (state, action) => {
  switch (action.type) {
    case 'SAVE_APP_NAME':
      if (state.appId !== action.payload.appId) {
        return state;
      }
      return { ...state, name: action.payload.name };
    case 'SAVE_INVITE':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, invited: [...state.invited, action.payload] };
    case 'DELETE_DEV':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, developers: action.payload.developers };
    case 'DELETE_INVITE':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, invited: action.payload.invited };
    case 'GEN_MASTER':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, keys: { ...state.keys, master: action.payload.masterKey } };
    case 'GEN_CLIENT':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, keys: { ...state.keys, js: action.payload.clientKey } };
    case 'FETCH_TABLES':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, tables: [...action.payload.tables] };
    case 'ADD_TABLE':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, tables: [...state.tables, action.payload.newTable] };
    case 'DELETE_TABLE':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, tables: state.tables.filter((table) => table.name !== action.payload.name) };
    case 'FETCH_INVOICES':
      if (state.appId !== action.payload.appId) { return state; }
      return { ...state, invoices: [...action.payload.invoices] };
    default:
      return state;
  }
};

export default function (state = [], action) {
  switch (action.type) {
    case 'FETCH_APPS': {
      return action.payload;
    }

    case 'ADD_APP': {
      return [...state, action.payload];
    }
    case 'SAVE_APP_NAME': {
      return state.map(t => app(t, action));
    }
    case 'SAVE_INVITE': {
      return state.map(t => app(t, action));
    }
    case 'DELETE_DEV': {
      return state.map(t => app(t, action));
    }
    case 'DELETE_INVITE': {
      return state.map(t => app(t, action));
    }
    case 'GEN_MASTER': {
      return state.map(t => app(t, action));
    }
    case 'GEN_CLIENT': {
      return state.map(t => app(t, action));
    }
    case 'DELETE_APP': {
      return state.filter(t => t.appId !== action.payload.appId);
    }
    case 'DISABLE_APP': {
      return state.map(t => {
        if (t.appId === action.payload.appId) {
          t.disabled = true;
        }
        return t;
      });
    }
    case 'LOGOUT':
      return [];
    case 'FETCH_TABLES': {
      return state.map(t => app(t, action));
    }
    case 'ADD_TABLE': {
      return state.map(t => app(t, action));
    }
    case 'DELETE_TABLE': {
      return state.map(t => app(t, action));
    }
    case 'FETCH_INVOICES': {
      return state.map(i => app(i, action));
    }
    default:
      return state;
  }
}

export function events (state = [], action) {
  switch (action.type) {
    case 'EVENTS': {
      var eventList = [];
      for (var i = 0; i < action.data.length; i++) {
        eventList.push(action.data[i].document.name);
      }
      return eventList;
    }
    default:
      return state;
  }
}

export function channels (state = [], action) {
  switch (action.type) {
    case 'CHANNELS_LIST': {
      var channelList = action.payload.channels;
      return channelList;
    }
    default:
      return state;
  }
}
